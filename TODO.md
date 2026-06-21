# TODO - Back office Galeri changes

## Completed
- [x] Identify UI location for Galeri admin.
- [x] Read current `AdminGaleri` implementation.
- [x] Verify backend `/api/galeri` supports bulk create (items array).
- [x] Confirm interpretation for “max 10 file”: bulk create up to 10 items.
- [x] Approval received to rewrite `src/components/admin/admin-galeri.tsx`.

## In progress
- [ ] Rewrite `src/components/admin/admin-galeri.tsx`:
  - [ ] Remove "Tambah Item" entry point (AdminPageHeader onAdd) and "Tambah Massal" button/dialog.
  - [ ] Add buttons: "Tambah Foto" and "Tambah Video".
  - [ ] Split add dialog into mode FOTO/VIDEO with kategori fixed (no editable Select).
  - [ ] FOTO:
    - [ ] Remove field "URL Thumbnail".
    - [ ] Replace "URL Foto" with dynamic local multi-file select (max 10).
    - [ ] When user selects files, append next file picker dynamically.
    - [ ] On submit: upload all selected files, build bulk payload (1 item per file).
    - [ ] Thumbnail for all created items = uploaded URL of the first selected file.
  - [ ] VIDEO:
    - [ ] Keep "URL Video" as text input.
    - [ ] Replace "URL Thumbnail" with local file select (single).
    - [ ] On submit: upload thumbnail file, then POST/PUT with thumbnail url.
  - [ ] Ensure edit flow does not break (FOTO edit uses existing string values; no URL Thumbnail field in UI).

## Followup
- [ ] Manual test in browser:
  - [ ] Tambah Foto: pick 1..10 files, submit creates N items.
  - [ ] Thumbnail semua item sama dengan file pertama.
  - [ ] Tambah Video: thumbnail upload from local select works.

