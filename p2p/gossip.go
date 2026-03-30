package main

import (
	"crypto/sha256"

	"github.com/libp2p/go-libp2p/core/peer"
	mh "github.com/multiformats/go-multihash"
	"github.com/ipfs/go-cid"
)

// strToCid converts an arbitrary string to a CID suitable for DHT Provide/FindProviders.
// Uses SHA2-256 hash wrapped in a raw CID.
func strToCid(s string) (cid.Cid, error) {
	hash := sha256.Sum256([]byte(s))
	multihash, err := mh.Encode(hash[:], mh.SHA2_256)
	if err != nil {
		return cid.Cid{}, err
	}
	return cid.NewCidV1(cid.Raw, multihash), nil
}

// peerIDFromString parses a peer ID string.
func peerIDFromString(s string) (peer.ID, error) {
	return peer.Decode(s)
}
