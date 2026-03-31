"""Flow EVM Testnet payment module — transfers FLOW from Robot A to Robot B."""

import os
from web3 import Web3

FLOW_EVM_TESTNET_RPC = "https://testnet.evm.nodes.onflow.org"
FLOWSCAN_BASE = "https://evm-testnet.flowscan.io/tx"

# Payment amount in FLOW (adjust as needed for demo)
PAYMENT_AMOUNT_FLOW = 10


def send_payment(receipt_hash: str) -> dict:
    """Send FLOW tokens from Robot A to Robot B on Flow EVM testnet.

    Args:
        receipt_hash: The delivery receipt hash (logged on-chain in tx data).

    Returns:
        dict with tx_hash and flowscan_url, or error info.
    """
    w3 = Web3(Web3.HTTPProvider(FLOW_EVM_TESTNET_RPC))

    if not w3.is_connected():
        raise ConnectionError("Cannot connect to Flow EVM testnet RPC")

    private_key = os.getenv("FLOW_PRIVATE_KEY")
    sender = os.getenv("ROBOT_A_ADDRESS")
    receiver = os.getenv("ROBOT_B_ADDRESS")

    if not all([private_key, sender, receiver]):
        raise ValueError("Missing FLOW_PRIVATE_KEY, ROBOT_A_ADDRESS, or ROBOT_B_ADDRESS in .env")

    sender = Web3.to_checksum_address(sender)
    receiver = Web3.to_checksum_address(receiver)

    nonce = w3.eth.get_transaction_count(sender)
    gas_price = w3.eth.gas_price

    tx = {
        "nonce": nonce,
        "to": receiver,
        "value": w3.to_wei(PAYMENT_AMOUNT_FLOW, "ether"),
        "gasPrice": gas_price,
        "chainId": 545,  # Flow EVM testnet chain ID
        "data": w3.to_bytes(text=f"sovereign-swarm:{receipt_hash[:32]}"),
    }

    # data field increases gas beyond base 21000, estimate with buffer
    tx["gas"] = w3.eth.estimate_gas(tx) + 1000

    signed = w3.eth.account.sign_transaction(tx, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    tx_hash_hex = tx_hash.hex()

    # Wait for confirmation
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)

    return {
        "tx_hash": tx_hash_hex,
        "flowscan_url": f"{FLOWSCAN_BASE}/0x{tx_hash_hex}",
        "status": "success" if receipt.status == 1 else "failed",
        "block": receipt.blockNumber,
        "amount": PAYMENT_AMOUNT_FLOW,
    }


def store_audit_cid(piece_cid: str, receipt_hash: str) -> dict:
    """Anchor the Filecoin PieceCID on Flow EVM testnet as an immutable audit record.

    Sends a self-transaction (Robot A → Robot A) with the PieceCID embedded
    in the data field. Costs minimal gas, no FLOW transferred.

    Returns:
        dict with tx_hash, flowscan_url, status.
    """
    w3 = Web3(Web3.HTTPProvider(FLOW_EVM_TESTNET_RPC))

    if not w3.is_connected():
        raise ConnectionError("Cannot connect to Flow EVM testnet RPC")

    private_key = os.getenv("FLOW_PRIVATE_KEY")
    sender = os.getenv("ROBOT_A_ADDRESS")

    if not all([private_key, sender]):
        raise ValueError("Missing FLOW_PRIVATE_KEY or ROBOT_A_ADDRESS in .env")

    sender = Web3.to_checksum_address(sender)
    nonce = w3.eth.get_transaction_count(sender)
    gas_price = w3.eth.gas_price

    # Self-tx: value=0, data encodes the PieceCID + receipt anchor
    data_str = f"sovereign-swarm:audit:{piece_cid}:{receipt_hash[:16]}"

    tx = {
        "nonce": nonce,
        "to": sender,
        "value": 0,
        "gasPrice": gas_price,
        "chainId": 545,
        "data": w3.to_bytes(text=data_str),
    }
    tx["gas"] = w3.eth.estimate_gas(tx) + 1000

    signed = w3.eth.account.sign_transaction(tx, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    tx_hash_hex = tx_hash.hex()

    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)

    return {
        "tx_hash": tx_hash_hex,
        "flowscan_url": f"{FLOWSCAN_BASE}/0x{tx_hash_hex}",
        "status": "success" if receipt.status == 1 else "failed",
        "piece_cid": piece_cid,
    }
