from PyPDF2 import PdfReader
reader = PdfReader("d:/AI resume screenner/BOODY_1234.pdf")
text = ""
for page in reader.pages:
    text += page.extract_text() + "\n"
with open("d:/AI resume screenner/temp.txt", "w", encoding="utf-8") as f:
    f.write(text)
