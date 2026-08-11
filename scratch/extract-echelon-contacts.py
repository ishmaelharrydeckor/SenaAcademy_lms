import os
import re
import json
import pandas as pd

src_dir = r"C:\Users\user\Downloads\Telegram Desktop\contact3"
out_file = r"C:\Users\user\Desktop\PROJECTS\lms\scratch\echelon_contacts.json"

def clean_phone(phone_str):
    if not phone_str:
        return None
    # Strip everything except digits
    digits = re.sub(r'\D', '', str(phone_str))
    
    # Format to international 233 format
    if digits.startswith('0'):
        digits = '233' + digits[1:]
    elif digits.startswith('33'):
        digits = '2' + digits
    elif not digits.startswith('233') and len(digits) == 9:
        digits = '233' + digits
        
    if len(digits) == 12 and digits.startswith('233'):
        return digits
    return None

def extract_first_name(full_name_str):
    if not full_name_str or pd.isna(full_name_str):
        return "there"
    name = str(full_name_str).strip()
    # Split by spaces and get the first word
    parts = name.split()
    if parts:
        first = parts[0].strip()
        # Clean any non-alpha chars
        first_clean = re.sub(r'[^a-zA-Z-]', '', first)
        if first_clean:
            return first_clean.capitalize()
    return "there"

def main():
    print(f"Scanning Echelon contacts in: {src_dir}")
    extracted = []
    seen_phones = set()
    
    files = [os.path.join(src_dir, f) for f in os.listdir(src_dir) if f.endswith('.xlsx')]
    
    for f in files:
        print(f"Parsing: {os.path.basename(f)}...")
        try:
            df = pd.read_excel(f)
            # Find the columns
            name_col = 'Full Name' if 'Full Name' in df.columns else ('Name' if 'Name' in df.columns else None)
            phone_col = 'WhatsApp Number' if 'WhatsApp Number' in df.columns else None
            
            if not name_col or not phone_col:
                print(f"[-] Error: Could not find Name or Phone columns in {os.path.basename(f)}")
                continue
                
            for idx, row in df.iterrows():
                raw_name = row[name_col]
                raw_phone = row[phone_col]
                
                phone = clean_phone(raw_phone)
                first_name = extract_first_name(raw_name)
                
                if phone and phone not in seen_phones:
                    seen_phones.add(phone)
                    extracted.append({
                        "firstName": first_name,
                        "phone": phone
                    })
        except Exception as e:
            print(f"[-] Error reading {os.path.basename(f)}: {e}")
            
    # Save results
    with open(out_file, 'w', encoding='utf-8') as out:
        json.dump(extracted, out, indent=2)
        
    print(f"\nExtraction complete! Found {len(extracted)} unique valid contacts.")
    print(f"Saved to: {out_file}")

if __name__ == '__main__':
    main()
