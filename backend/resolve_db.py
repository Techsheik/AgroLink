import socket
hosts = ["aws-1-eu-north-1.pooler.supabase.com", "db.bvduqjpelvlodnosdpvq.supabase.co"]
for h in hosts:
    try:
        ip = socket.gethostbyname(h)
        print(f"{h} -> {ip}")
    except Exception as e:
        print(f"Failed to resolve {h}: {e}")
