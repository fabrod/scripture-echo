#!/usr/bin/env python3
"""Batch-split the complete LibriVox ASV (Ron Altman) into chapter MP3s.

Reads the archive.org metadata (129 section files, titles like
"037 - 2 Kings 19-25"), maps each section to (book, first, last) using the
validated ASV data for chapter counts, asserts gapless 1..N coverage per
book (1,189 chapters total), then runs split_chapters.py per section.
Resume-safe: sections whose chapters already fill the manifest are skipped.

Usage: batch_asv.py <meta.json> <sections_dir> <data_dir> <out_root>
"""
import json, os, re, subprocess, sys

def main():
    meta_path, sec_dir, data_dir, out_root = sys.argv[1:5]
    meta = json.load(open(meta_path))
    asv = json.load(open(os.path.join(data_dir, "asv.json")))
    name2code = {b["name"]: b["code"] for b in asv["books"]}
    chcount = {b["code"]: len(b["chapters"]) for b in asv["books"]}
    files = sorted(
        (f for f in meta["files"] if f["name"].endswith("_64kb.mp3")),
        key=lambda f: f["name"])
    plan = []
    for f in files:
        title = f.get("title", "")
        m = re.match(r"\d+ - (.+?)(?: (\d+)-(\d+)| (\d+))?$", title)
        if not m:
            print(f"!! cannot parse title: {title!r}")
            sys.exit(1)
        name, a, b, single = m.group(1), m.group(2), m.group(3), m.group(4)
        code = name2code[name]
        if a:
            first, last = int(a), int(b)
        elif single:
            first = last = int(single)
        else:
            first, last = 1, chcount[code]
        plan.append((f["name"], code, first, last))
    # gapless coverage assertion
    cover = {}
    for _, code, a, b in plan:
        cover.setdefault(code, []).extend(range(a, b + 1))
    total = 0
    for b in asv["books"]:
        got = sorted(cover.get(b["code"], []))
        want = list(range(1, chcount[b["code"]] + 1))
        assert got == want, f"{b['code']}: coverage {got[:3]}... != 1..{chcount[b['code']]}"
        total += len(got)
    assert total == 1189, total
    print(f"plan OK: {len(plan)} sections, {total} chapters, gapless")
    man_path = os.path.join(out_root, "manifest-asv.json")
    done = set()
    if os.path.exists(man_path):
        for e in json.load(open(man_path)):
            done.add((e["book"], e["chapter"]))
    splitter = os.path.join(os.path.dirname(os.path.abspath(__file__)), "split_chapters.py")
    for fname, code, a, b in plan:
        if all((code, c) in done for c in range(a, b + 1)):
            print(f"skip {fname} ({code} {a}-{b}) — already split")
            continue
        print(f"== {fname} -> {code} {a}-{b}", flush=True)
        subprocess.run(["python3", splitter, os.path.join(sec_dir, fname),
                        "ASV", code, str(a), str(b), out_root], check=True)
    print("BATCH COMPLETE")

if __name__ == "__main__":
    main()
