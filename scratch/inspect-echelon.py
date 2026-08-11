import os
import pandas as pd

src_dir = r"C:\Users\user\Downloads\Telegram Desktop\contact3"

for f in os.listdir(src_dir):
    f_path = os.path.join(src_dir, f)
    if os.path.isfile(f_path) and f.endswith('.xlsx'):
        print(f"\n=============================================")
        print(f"File: {f}")
        print(f"=============================================")
        try:
            xls = pd.ExcelFile(f_path)
            for sheet in xls.sheet_names:
                df = pd.read_excel(f_path, sheet_name=sheet)
                print(f"Sheet Name: {sheet}")
                print("Columns:")
                print(df.columns.tolist())
                print("\nFirst 3 rows:")
                print(df.head(3).to_string())
        except Exception as e:
            print(f"Error reading file: {e}")
