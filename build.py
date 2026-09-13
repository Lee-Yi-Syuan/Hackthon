# -*- coding: utf-8 -*-
"""
把 src/ 底下的模組組合成單一的 index.html。

用法：
    python build.py            組合並寫出 index.html
    python build.py --check    只比對，不寫檔（確認 index.html 與 src/ 一致）

為什麼要這樣做：
    線上展示需要單一 HTML 檔（沒有建置流程、沒有相依套件、雙擊就能開），
    但一個三千行的檔案沒辦法多人同時改——每次合併都會衝突。
    所以原始碼拆在 src/ 裡各自獨立，發佈前跑這支腳本組回去。

    改東西請改 src/ 底下的檔案，不要直接改 index.html，它會被覆蓋。

    檔名是 index.html 而非 app.html，因為所有靜態主機都以它為目錄入口。

組合順序由檔名的數字前綴決定，要新增區塊就照編號插進去。
"""
import io
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
OUT = os.path.join(ROOT, "index.html")


def read(path):
    return io.open(path, encoding="utf-8", newline="").read()


def read_dir(name):
    """讀取 src/<name>/ 底下所有檔案，依檔名排序後串接。"""
    d = os.path.join(SRC, name)
    if not os.path.isdir(d):
        sys.exit("找不到目錄：%s" % d)
    files = sorted(f for f in os.listdir(d) if not f.startswith("."))
    if not files:
        sys.exit("目錄是空的：%s" % d)
    return "".join(read(os.path.join(d, f)) for f in files), files


def build():
    head = read(os.path.join(SRC, "head.html"))
    css, css_files = read_dir("css")
    views, view_files = read_dir("views")
    js, js_files = read_dir("js")

    tail_path = os.path.join(SRC, "tail.html")
    tail = read(tail_path) if os.path.exists(tail_path) else "\n"

    # CSS 與 JS 都併進單一標籤，維持原本的全域作用域與提升行為
    out = head + "<style>" + css + "</style>" + views + "<script>" + js + "</script>" + tail
    return out, (css_files, view_files, js_files)


def main():
    out, (css_files, view_files, js_files) = build()
    check = "--check" in sys.argv

    if check:
        if not os.path.exists(OUT):
            sys.exit("index.html 不存在，請先執行：python build.py")
        cur = read(OUT)
        if cur == out:
            print("一致：index.html 與 src/ 相符")
            return 0
        print("不一致：index.html 與 src/ 有差異（%d vs %d bytes）" % (len(cur), len(out)))
        print("請執行 python build.py 重新組合。")
        return 1

    io.open(OUT, "w", encoding="utf-8", newline="").write(out)
    print("已寫出 index.html — %.0f KB" % (len(out.encode("utf-8")) / 1024))
    print("  css   %2d 個檔案" % len(css_files))
    print("  views %2d 個檔案" % len(view_files))
    print("  js    %2d 個檔案" % len(js_files))
    return 0


if __name__ == "__main__":
    sys.exit(main())
