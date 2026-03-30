package main

import (
	"bufio"
	"context"
	"fmt"
	"log"

	"github.com/libp2p/go-libp2p/core/network"
	"github.com/libp2p/go-libp2p/core/protocol"
)

const directMsgProtocol = protocol.ID("/sovereign-swarm/direct/1.0.0")

// setupStreamHandler registers the handler for incoming direct messages.
func setupStreamHandler(d *Daemon) {
	d.Host.SetStreamHandler(directMsgProtocol, func(s network.Stream) {
		defer s.Close()
		reader := bufio.NewReader(s)
		msg, err := reader.ReadString('\n')
		if err != nil {
			log.Printf("Error reading stream: %v", err)
			return
		}
		// Trim newline
		if len(msg) > 0 && msg[len(msg)-1] == '\n' {
			msg = msg[:len(msg)-1]
		}
		d.addToInbox(InboxMessage{
			From:    s.Conn().RemotePeer().String(),
			Type:    "direct",
			Payload: msg,
		})
		log.Printf("[%s] Direct message from %s: %s", d.RobotName, s.Conn().RemotePeer().ShortString(), msg)
	})
}

// sendDirectMessage opens a stream to the target peer and sends a message.
func sendDirectMessage(ctx context.Context, d *Daemon, peerIDStr string, message string) error {
	pid, err := peerIDFromString(peerIDStr)
	if err != nil {
		return fmt.Errorf("invalid peer ID: %w", err)
	}

	// Ensure we're connected
	if d.Host.Network().Connectedness(pid) != network.Connected {
		peerInfo := d.Host.Peerstore().PeerInfo(pid)
		if err := d.Host.Connect(ctx, peerInfo); err != nil {
			return fmt.Errorf("connect to peer: %w", err)
		}
	}

	s, err := d.Host.NewStream(ctx, pid, directMsgProtocol)
	if err != nil {
		return fmt.Errorf("open stream: %w", err)
	}
	defer s.Close()

	_, err = fmt.Fprintf(s, "%s\n", message)
	if err != nil {
		return fmt.Errorf("write message: %w", err)
	}
	log.Printf("[%s] Sent direct message to %s", d.RobotName, pid.ShortString())
	return nil
}
