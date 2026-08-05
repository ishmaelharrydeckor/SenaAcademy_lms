import os
import re
import json
import pandas as pd
from pypdf import PdfReader

# Directories
src_dir = r"C:\Users\user\Downloads\Telegram Desktop\contacts2"
out_file = r"C:\Users\user\Desktop\PROJECTS\lms\scratch\new_campaign_contacts.json"

phone_pattern = re.compile(r'\b(?:\+?233|0)?[25][0-9]{8}\b')

def clean_phone(phone_str):
    if not phone_str:
        return None
    # Strip everything except digits
    digits = re.sub(r'\D', '', phone_str)
    
    # Format to international 233 format
    if digits.startswith('0'):
        digits = '233' + digits[1:]
    elif digits.startswith('33'):
        digits = '2' + digits
    elif not digits.startswith('233') and len(digits) == 9:
        digits = '233' + digits
        
    # Final validation check
    if len(digits) == 12 and digits.startswith('233'):
        return digits
    return None

def extract_from_excel(file_path):
    phones = set()
    try:
        xls = pd.ExcelFile(file_path)
        for sheet_name in xls.sheet_names:
            df = pd.read_excel(xls, sheet_name=sheet_name)
            # Flatten all cell values
            for col in df.columns:
                for val in df[col]:
                    val_str = str(val).strip()
                    # Check for phone numbers using regex
                    matches = phone_pattern.findall(val_str)
                    for m in matches:
                        cleaned = clean_phone(m)
                        if cleaned:
                            phones.add(cleaned)
    except Exception as e:
        print(f"Error parsing Excel file {os.path.basename(file_path)}: {e}")
    return phones

def extract_from_pdf(file_path):
    phones = set()
    try:
        reader = PdfReader(file_path)
        for page in reader.pages:
            text = page.extract_text()
            if text:
                matches = phone_pattern.findall(text)
                for m in matches:
                    cleaned = clean_phone(m)
                    if cleaned:
                        phones.add(cleaned)
    except Exception as e:
        print(f"Error parsing PDF file {os.path.basename(file_path)}: {e}")
    return phones

def main():
    print(f"Scanning directory: {src_dir}")
    all_phones = set()
    files = [os.path.join(src_dir, f) for f in os.listdir(src_dir) if os.path.isfile(os.path.join(src_dir, f))]
    
    for f in files:
        ext = os.path.splitext(f)[1].lower()
        if ext in ['.xlsx', '.xls']:
            safe_name = os.path.basename(f).encode('ascii', 'ignore').decode('ascii')
            print(f"Parsing Excel: {safe_name}...")
            phones = extract_from_excel(f)
            print(f" -> Found {len(phones)} numbers.")
            all_phones.update(phones)
        elif ext == '.pdf':
            safe_name = os.path.basename(f).encode('ascii', 'ignore').decode('ascii')
            print(f"Parsing PDF: {safe_name}...")
            phones = extract_from_pdf(f)
            print(f" -> Found {len(phones)} numbers.")
            all_phones.update(phones)
            
    unique_list = sorted(list(all_phones))
    
    # Save output
    os.makedirs(os.path.dirname(out_file), exist_ok=True)
    with open(out_file, 'w', encoding='utf-8') as out:
        json.dump(unique_list, out, indent=2)
        
    print(f"\nCompleted! Total unique formatted phone numbers extracted: {len(unique_list)}")
    print(f"Saved to: {out_file}")

if __name__ == '__main__':
    main()
