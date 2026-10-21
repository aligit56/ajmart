# Products Requiring Owner Input

This document lists products where information (exact packaging, variant, size, or brand naming) is ambiguous or could not be determined with 100% confidence from the existing database entries and standard catalogs.

These products are currently mapped to `/images/placeholder-product.jpg` until clarified by the store owner.

---

### 1. Door Soap
- **Category**: Personal Care
- **Product ID**: 125
- **Brand in DB**: Door
- **Variant in DB**: Standard (Price: Rs 113)
- **What was found vs what is unclear**:
  - No registered commercial soap brand named "Door Soap" exists in major Pakistani FMCG retail distribution (Naheed, Daraz, Carrefour, Metro).
  - Unclear whether this is:
    1. A phonetic/keyboard typo for **Dove Soap** (though Dove Soap already exists as product #126 at Rs 125).
    2. A typo for **Dettol Soap** (standard antibacterial soap bar selling for ~Rs 110–120 in Pakistan).
    3. A small local cottage/regional soap bar sold in Rawalpindi/Islamabad wholesale markets.
- **Recommended Action**:
  - Clarify the brand name or intended product (e.g., if Dettol Soap, update product name and brand).
  - If a physical local product, provide a photo of the packaging to upload via the Admin Panel.
- **Search Link**: [Google Search: Door soap Pakistan](https://www.google.com/search?q=Door+soap+Pakistan)

---

### 2. Laar Soap
- **Category**: Personal Care
- **Product ID**: 124
- **Brand in DB**: Laar
- **Variant in DB**: Standard (Price: Rs 138)
- **What was found vs what is unclear**:
  - No widespread mainstream FMCG brand is registered as "Laar Soap".
  - Potential matches:
    1. **Lara Soap** (Lara Beauty Soap / Lara Classic by Gamalux Oleochemicals / 414 Group), widely distributed in Pakistan.
    2. A regional wholesale bath or laundry soap brand.
- **Recommended Action**:
  - Confirm if the product is **Lara Soap** or a specific local brand.
  - If a physical pack is in stock, provide the pack image or upload via Admin Panel.
- **Search Link**: [Google Search: Lara soap Pakistan](https://www.google.com/search?q=Lara+soap+Pakistan)

---

### 3. Shampoo Sizing & Variants (Notice for Owner)
- **Products**: Lifeboy Shampoo (#106), Sunsilk Shampoo (#107), Tresme Shampoo (#108), Loreal Shampoo (#109), Bio Amla Shampoo (#110), Vatika Shampoo (#111), Hello Hair Shampoo (#112), Mclay Shampoo (#113), Head & Shoulders (#114), Pantene Shampoo (#115), Conditioner Mclay (#116).
- **Current DB Setup**: Each product has three selectable variants: `275 ml`, `345 ml`, `500 ml`.
- **Note**: The sourced packshot represents the primary product front packaging (clean bottle without printed size callouts). If the owner wishes to display distinct pack photos per size variant (e.g. 175ml vs 360ml vs 650ml), those can be uploaded or specified per variant.

---

### 4. AJ Brand Loose Spices (Notice for Owner)
- **Products**:
  - Haldi 200gm (#49)
  - Lal Mirch 200gm (#50)
  - Dara Mirch 200gm (#51)
  - Salan Masala 100gm (#52)
- **Current Status**: Mapped to `/images/placeholder-product.jpg`.
- **Note**: These are AJ Brand loose/house-packaged spices. When custom branded bags, pouches, or clear jars are ready, photos can be uploaded via the Admin Panel or added to `/backend/public/images/products/spices/`.

---

### 5. Spices Naming Observations (Task 9)
- **Mahran vs Mehran**: All 7 products (`Mahran Tikka`, `Mahran Fish`, `Mahran Haleem`, `Mahran Chapli Kabab`, `Mahran Shami Kabab`, `Mahran Paya`, `Mahran Chat Masala`) are registered under brand **Mehran** (Mehran Spice & Food Industries). In the database, the product name uses the spelling `Mahran`. The official Mehran packaging has been matched and loaded.
- **National Murgi**: Sourced the official **National Murghi Recipe Mix / Chicken Masala** packshot from National Foods.
- **Shan Adrak**: Sourced the official **Shan Ginger Paste** bottle (Rs 250 in DB, matching the paste bottle in market). If the owner meant Shan Adrak (Ginger) Powder (50g box), this can be adjusted upon owner confirmation.

---

### 6. Pulses Status & Missing Products
- **Malka Sabit Masar** (#22):
  - **Status**: MISSING PHOTO. Retained with `/images/placeholder-product.jpg`.
  - **Note**: No photo matching Malka Sabit Masar was found in the uploaded pulses folder.
- **Extra Photos Provided**:
  - `white lobia.jfif`: High quality photo of White Lobia (Black-eyed peas / Safaid Lobia). No matching "White Lobia" product exists in the DB currently.
  - `mash chilka.jfif`: High quality photo of Daal Mash Chilka (Split Urad with husk). The DB currently has `Mong Chilka Dall` (#24) and `Dall Mash` (#21), but no dedicated `Daal Mash Chilka`.
  - These two photos are preserved in the pulses folder and ready whenever these products are added to the catalog.
