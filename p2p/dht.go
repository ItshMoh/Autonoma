package main

import (
	"context"
	"fmt"
	"log"

	dht "github.com/libp2p/go-libp2p-kad-dht"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/peer"
)

// capabilityKey returns the DHT key for a given capability.
// Peers providing a capability use DHT.Provide() with this key's CID.
func capabilityKey(cap string) string {
	return "/sovereign-swarm/cap/" + cap
}

// setupDHT creates and bootstraps a Kademlia DHT instance.
func setupDHT(ctx context.Context, h host.Host) (*dht.IpfsDHT, error) {
	kadDHT, err := dht.New(ctx, h, dht.Mode(dht.ModeServer))
	if err != nil {
		return nil, fmt.Errorf("create DHT: %w", err)
	}
	if err := kadDHT.Bootstrap(ctx); err != nil {
		return nil, fmt.Errorf("bootstrap DHT: %w", err)
	}
	log.Println("DHT bootstrapped")
	return kadDHT, nil
}

// announceCapability registers this peer as a provider of the given capability.
func announceCapability(ctx context.Context, d *Daemon, cap string) error {
	key := capabilityKey(cap)
	// Use the routing table to provide — the CID is derived from the key string.
	cid, err := strToCid(key)
	if err != nil {
		return fmt.Errorf("capability CID: %w", err)
	}
	if err := d.DHT.Provide(ctx, cid, true); err != nil {
		return fmt.Errorf("DHT provide: %w", err)
	}
	log.Printf("[%s] Announced capability: %s", d.RobotName, cap)
	return nil
}

// findPeersWithCapability queries the DHT for peers that announced the given capability.
func findPeersWithCapability(ctx context.Context, d *Daemon, cap string) ([]PeerInfo, error) {
	key := capabilityKey(cap)
	cid, err := strToCid(key)
	if err != nil {
		return nil, fmt.Errorf("capability CID: %w", err)
	}

	provCh := d.DHT.FindProvidersAsync(ctx, cid, 10)
	var results []PeerInfo
	for p := range provCh {
		if p.ID == d.Host.ID() {
			continue // skip self
		}
		if p.ID == peer.ID("") {
			continue
		}
		addrs := make([]string, 0, len(p.Addrs))
		for _, a := range p.Addrs {
			addrs = append(addrs, fmt.Sprintf("%s/p2p/%s", a, p.ID))
		}
		results = append(results, PeerInfo{
			PeerID: p.ID.String(),
			Addrs:  addrs,
		})
	}
	return results, nil
}

// PeerInfo is returned from DHT queries.
type PeerInfo struct {
	PeerID string   `json:"peer_id"`
	Addrs  []string `json:"addrs"`
}
