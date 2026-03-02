"""Generate minimal placeholder PNG icons for Tauri."""
import os
import struct
import zlib

def png(width: int, height: int, r: int, g: int, b: int) -> bytes:
    """Create a flat-colour RGBA PNG (Tauri requires RGBA)."""
    def chunk(tag: bytes, data: bytes) -> bytes:
        crc = zlib.crc32(tag + data) & 0xFFFFFFFF
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", crc)

    signature = b"\x89PNG\r\n\x1a\n"
    # color type 6 = RGBA (8 bits per channel)
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    ihdr = chunk(b"IHDR", ihdr_data)

    raw_rows = b""
    for _y in range(height):
        raw_rows += b"\x00"  # filter type: None
        raw_rows += bytes([r, g, b, 255] * width)  # RGBA pixels

    idat = chunk(b"IDAT", zlib.compress(raw_rows, 9))
    iend = chunk(b"IEND", b"")

    return signature + ihdr + idat + iend


if __name__ == "__main__":
    # Place icons in src-tauri/icons/ relative to the project root
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out = os.path.join(project_root, "src-tauri", "icons")
    os.makedirs(out, exist_ok=True)

    # Soft green — matches app accent
    R, G, B = 74, 222, 128

    for size in (16, 24, 32, 48, 64, 128, 256):
        data = png(size, size, R, G, B)
        path = os.path.join(out, f"{size}x{size}.png")
        with open(path, "wb") as f:
            f.write(data)
        print(f"  {path}")

    # Aliases expected by tauri.conf.json / bundle
    for alias, source in [
        ("128x128@2x.png", "256x256.png"),
        ("tray.png", "32x32.png"),
    ]:
        src = os.path.join(out, source)
        dst = os.path.join(out, alias)
        if os.path.exists(src):
            with open(src, "rb") as f:
                data = f.read()
            with open(dst, "wb") as f:
                f.write(data)
            print(f"  {dst}")

    print("Icons generated.")
