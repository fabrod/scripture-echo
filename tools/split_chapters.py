#!/usr/bin/env python3
"""Split a LibriVox section file (multiple chapters) into per-chapter MP3s.

Boundaries are detected from silence clusters: a chapter break in these
recordings is [end of chapter] pause [chapter announcement] pause [text],
which produces a cluster of 2-3 silences within a few seconds, unlike the
single dramatic pauses inside a chapter.

Every split is logged to the manifest with "verified": false — a human must
spot-check boundaries before the audio is treated as final (studio QA rule).

Usage:
  split_chapters.py <section.mp3> <TRANSLATION> <BOOKCODE> <first_ch> <last_ch> <out_root>
"""
import json, os, re, subprocess, sys, hashlib

def silences(path):
    out = subprocess.run(
        ["ffmpeg", "-i", path, "-af", "silencedetect=noise=-42dB:d=1.4", "-f", "null", "-"],
        capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    return list(zip(starts, ends))

def clusters(sils, gap=6.0):
    cl = []
    for s in sils:
        if cl and s[0] - cl[-1][-1][1] <= gap:
            cl[-1].append(s)
        else:
            cl.append([s])
    return cl

def duration(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", path], capture_output=True, text=True)
    return float(r.stdout.strip())

def main():
    src, trans, book, first_ch, last_ch, out_root = sys.argv[1:7]
    first_ch, last_ch = int(first_ch), int(last_ch)
    n = last_ch - first_ch + 1
    total = duration(src)
    cls = clusters(silences(src))
    # boundary clusters: >=2 silences (announcement pattern), not the intro cluster
    intro_end = None
    bounds = []
    for i, c in enumerate(cls):
        span = c[-1][1] - c[0][0]
        if i == 0 and c[0][0] < 60:
            intro_end = c[-1][1]  # end of disclaimer/intro cluster
            continue
        if len(c) >= 2 or span >= 4.5:
            bounds.append(c[0][1] - 0.2)  # chapter starts when its announcement begins
    # If the final cluster is the LibriVox outro ("End of ..."), it will appear
    # as one extra boundary; drop extras from the end beyond n-1 boundaries.
    outro_at = None
    while len(bounds) > n - 1:
        outro_at = bounds.pop()
    starts = [intro_end if intro_end is not None else 0.0] + bounds
    ends = starts[1:] + [outro_at if outro_at is not None else total]
    outdir = os.path.join(out_root, trans.lower(), book)
    os.makedirs(outdir, exist_ok=True)
    entries = []
    for i in range(n):
        ch = first_ch + i
        s, e = starts[i], ends[i]
        out = os.path.join(outdir, f"{ch:03d}.mp3")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{s:.2f}", "-to", f"{e:.2f}",
                        "-i", src, "-codec:a", "libmp3lame", "-q:a", "4", out], check=True)
        d = duration(out)
        h = hashlib.sha256(open(out, "rb").read()).hexdigest()[:16]
        entries.append({"translation": trans, "book": book, "chapter": ch,
                        "file": os.path.relpath(out, out_root), "duration_sec": round(d, 1),
                        "sha256_16": h, "source_section": os.path.basename(src),
                        "boundary_start_sec": round(s, 2), "verified": False})
        print(f"{trans} {book} {ch}: start {s:.1f}s dur {d:.1f}s")
    man = os.path.join(out_root, f"manifest-{trans.lower()}.json")
    data = json.load(open(man)) if os.path.exists(man) else []
    data = [x for x in data if not (x["book"] == book and first_ch <= x["chapter"] <= last_ch)]
    data.extend(entries)
    data.sort(key=lambda x: (x["book"], x["chapter"]))
    json.dump(data, open(man, "w"), indent=1)
    print(f"manifest: {man} ({len(data)} chapters)")

if __name__ == "__main__":
    main()
