from flask import Blueprint, request, jsonify
import ipaddress

network_check = Blueprint('network_check', __name__)

# ✅ Allowed networks (local testing + coworking WiFi)
ALLOWED_NETWORKS = [
    ipaddress.ip_network("192.168.0.0/24")  # covers 192.168.1.1 - 192.168.1.255
]

@network_check.route('/check-network', methods=['GET'])
def check_network():
    client_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
    client_ip = client_ip.split(',')[0].strip()  # ✅ Take the first IP only
    print(f"📌 REAL DETECTED IP: {client_ip}")

    try:
        ip = ipaddress.ip_address(client_ip)
        for network in ALLOWED_NETWORKS:
            if ip in network:
                return jsonify({
                    "connected": True,
                    "message": f"Connected to allowed network ({client_ip})."
                })
        return jsonify({
            "connected": False,
            "message": f"Access denied. Connect to TBIDO_Coworking WiFi. Your IP: {client_ip}"
        }), 403

    except ValueError:
        return jsonify({
            "connected": False,
            "message": "Invalid IP address."
        }), 400
