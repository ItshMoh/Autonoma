package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/libp2p/go-libp2p"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/multiformats/go-multiaddr"
)

// Daemon holds the libp2p host and all subsystems.
type Daemon struct {
	Host      host.Host
	DHT       *dht.IpfsDHT
	PubSub    *pubsub.PubSub
	RobotName string
	HTTPPort  int

	// Inbox stores received direct messages and gossip messages.
	inboxMu sync.Mutex
	Inbox   []InboxMessage

	// Active gossipsub topics/subscriptions.
	topics map[string]*pubsub.Topic
	subs   map[string]*pubsub.Subscription
}

// InboxMessage is a received message.
type InboxMessage struct {
	From    string `json:"from"`
	Type    string `json:"type"` // "direct" or "gossip"
	Topic   string `json:"topic,omitempty"`
	Payload string `json:"payload"`
}

func main() {
	robotName := flag.String("robot", "robot_a", "Robot name (robot_a, robot_b, etc.)")
	httpPort := flag.Int("http-port", 8001, "HTTP API port")
	p2pPort := flag.Int("p2p-port", 9001, "libp2p listen port")
	bootstrap := flag.String("bootstrap", "", "Bootstrap peer multiaddr (empty for first node)")
	flag.Parse()

	ctx := context.Background()

	// Create libp2p host
	listenAddr, _ := multiaddr.NewMultiaddr(fmt.Sprintf("/ip4/127.0.0.1/tcp/%d", *p2pPort))
	h, err := libp2p.New(libp2p.ListenAddrs(listenAddr))
	if err != nil {
		log.Fatalf("Failed to create libp2p host: %v", err)
	}

	log.Printf("[%s] Peer ID: %s", *robotName, h.ID())
	for _, addr := range h.Addrs() {
		log.Printf("[%s] Listening on: %s/p2p/%s", *robotName, addr, h.ID())
	}

	// Initialize Kademlia DHT
	kadDHT, err := setupDHT(ctx, h)
	if err != nil {
		log.Fatalf("Failed to create DHT: %v", err)
	}

	// Bootstrap to another peer if provided
	if *bootstrap != "" {
		connectToBootstrap(ctx, h, *bootstrap)
	}

	// Initialize GossipSub
	ps, err := pubsub.NewGossipSub(ctx, h)
	if err != nil {
		log.Fatalf("Failed to create GossipSub: %v", err)
	}

	daemon := &Daemon{
		Host:      h,
		DHT:       kadDHT,
		PubSub:    ps,
		RobotName: *robotName,
		HTTPPort:  *httpPort,
		Inbox:     make([]InboxMessage, 0),
		topics:    make(map[string]*pubsub.Topic),
		subs:      make(map[string]*pubsub.Subscription),
	}

	// Set up direct message stream handler
	setupStreamHandler(daemon)

	// Subscribe to the default "swarm" topic
	if err := daemon.subscribeTopic(ctx, "swarm"); err != nil {
		log.Fatalf("Failed to subscribe to swarm topic: %v", err)
	}

	// Start HTTP API
	daemon.startHTTP()
}

func connectToBootstrap(ctx context.Context, h host.Host, addrStr string) {
	ma, err := multiaddr.NewMultiaddr(addrStr)
	if err != nil {
		log.Printf("Invalid bootstrap addr: %v", err)
		return
	}
	pi, err := peer.AddrInfoFromP2pAddr(ma)
	if err != nil {
		log.Printf("Failed to parse bootstrap peer info: %v", err)
		return
	}
	if err := h.Connect(ctx, *pi); err != nil {
		log.Printf("Failed to connect to bootstrap: %v", err)
	} else {
		log.Printf("Connected to bootstrap peer: %s", pi.ID)
	}
}

func (d *Daemon) addToInbox(msg InboxMessage) {
	d.inboxMu.Lock()
	defer d.inboxMu.Unlock()
	d.Inbox = append(d.Inbox, msg)
}

func (d *Daemon) drainInbox() []InboxMessage {
	d.inboxMu.Lock()
	defer d.inboxMu.Unlock()
	msgs := d.Inbox
	d.Inbox = make([]InboxMessage, 0)
	return msgs
}

func (d *Daemon) subscribeTopic(ctx context.Context, topicName string) error {
	topic, err := d.PubSub.Join(topicName)
	if err != nil {
		return err
	}
	sub, err := topic.Subscribe()
	if err != nil {
		return err
	}
	d.topics[topicName] = topic
	d.subs[topicName] = sub

	// Read messages in background
	go func() {
		for {
			msg, err := sub.Next(ctx)
			if err != nil {
				return
			}
			// Skip messages from self
			if msg.ReceivedFrom == d.Host.ID() {
				continue
			}
			d.addToInbox(InboxMessage{
				From:    msg.ReceivedFrom.String(),
				Type:    "gossip",
				Topic:   topicName,
				Payload: string(msg.Data),
			})
		}
	}()
	return nil
}

func (d *Daemon) startHTTP() {
	mux := http.NewServeMux()

	// GET /id — return peer ID and addresses
	mux.HandleFunc("/id", func(w http.ResponseWriter, r *http.Request) {
		addrs := make([]string, 0)
		for _, a := range d.Host.Addrs() {
			addrs = append(addrs, fmt.Sprintf("%s/p2p/%s", a, d.Host.ID()))
		}
		json.NewEncoder(w).Encode(map[string]interface{}{
			"peer_id": d.Host.ID().String(),
			"robot":   d.RobotName,
			"addrs":   addrs,
		})
	})

	// POST /announce?cap=<capability> — store capability in DHT
	mux.HandleFunc("/announce", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "POST only", http.StatusMethodNotAllowed)
			return
		}
		cap := r.URL.Query().Get("cap")
		if cap == "" {
			http.Error(w, "cap parameter required", http.StatusBadRequest)
			return
		}
		err := announceCapability(r.Context(), d, cap)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "announced", "capability": cap})
	})

	// GET /find-peer?cap=<capability> — find peers with capability via DHT
	mux.HandleFunc("/find-peer", func(w http.ResponseWriter, r *http.Request) {
		cap := r.URL.Query().Get("cap")
		if cap == "" {
			http.Error(w, "cap parameter required", http.StatusBadRequest)
			return
		}
		peers, err := findPeersWithCapability(r.Context(), d, cap)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]interface{}{"capability": cap, "peers": peers})
	})

	// POST /send — send direct message to a peer
	mux.HandleFunc("/send", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "POST only", http.StatusMethodNotAllowed)
			return
		}
		var body struct {
			Peer    string `json:"peer"`
			Message string `json:"message"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, "invalid JSON body", http.StatusBadRequest)
			return
		}
		err := sendDirectMessage(r.Context(), d, body.Peer, body.Message)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "sent"})
	})

	// POST /publish — publish to a gossipsub topic
	mux.HandleFunc("/publish", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "POST only", http.StatusMethodNotAllowed)
			return
		}
		var body struct {
			Topic   string `json:"topic"`
			Message string `json:"message"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, "invalid JSON body", http.StatusBadRequest)
			return
		}
		topicName := body.Topic
		if topicName == "" {
			topicName = "swarm"
		}
		topic, ok := d.topics[topicName]
		if !ok {
			// Join topic on-demand
			if err := d.subscribeTopic(r.Context(), topicName); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			topic = d.topics[topicName]
		}
		if err := topic.Publish(r.Context(), []byte(body.Message)); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "published", "topic": topicName})
	})

	// GET /inbox — drain all received messages
	mux.HandleFunc("/inbox", func(w http.ResponseWriter, r *http.Request) {
		msgs := d.drainInbox()
		json.NewEncoder(w).Encode(map[string]interface{}{"messages": msgs})
	})

	addr := fmt.Sprintf("127.0.0.1:%d", d.HTTPPort)
	log.Printf("[%s] HTTP API listening on %s", d.RobotName, addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}
