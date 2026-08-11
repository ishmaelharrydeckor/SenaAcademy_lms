import os
import pandas as pd

src_dir = r"C:\Users\user\Downloads\Telegram Desktop\contact3"

for f in os.listdir(src_dir):
    f_path = os.path.join(src_dir, f)
    if os.path.isfile(f_path) and f.endswith('.xlsx'):
        print(f"\nFile: {f}")
        try:
            df = pd.read_excel(f_path)
            print("Columns:", df.columns.tolist())
        except Exception as e:
            print(f"Error: {e}")
