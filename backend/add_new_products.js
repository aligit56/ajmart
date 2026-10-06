const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
    // 1. Add variants column if it doesn't exist
    db.all("PRAGMA table_info(Products)", (err, cols) => {
        const hasVariants = cols.some(c => c.name === 'variants');
        if (!hasVariants) {
            db.run("ALTER TABLE Products ADD COLUMN variants TEXT;", (err) => {
                if (err) console.error("Error adding variants column:", err);
                else console.log("Added variants column.");
                insertProducts();
            });
        } else {
            console.log("Variants column already exists.");
            insertProducts();
        }
    });
});

function insertProducts() {
    const products = [
        // Cleaning and Laundry (7)
        { name: 'Brite', category_id: 7, variants: [{name: '1 kg', price: 600}, {name: '500 gm', price: 320}] },
        { name: 'Express', category_id: 7, variants: [{name: '1 kg', price: 550}, {name: '500 gm', price: 290}] },
        { name: 'Bonus', category_id: 7, variants: [{name: '1 kg', price: 400}, {name: '100 wala', price: 100}] },
        { name: 'Sufi Detergent', category_id: 7, variants: [{name: '1 kg', price: 580}, {name: '500 gm', price: 300}] },
        { name: 'Surf Aj.', category_id: 7, variants: [{name: 'Regular', price: 200}] },
        
        { name: 'Sufi Soap Cloth', category_id: 7, variants: [{name: 'Standard', price: 150}] },
        { name: 'Sufi Vermicelli Cloth Soap', category_id: 7, variants: [{name: 'Standard', price: 160}] },
        { name: 'Bahu Soap Cloth', category_id: 7, variants: [{name: 'Standard', price: 140}] },

        // Household (5)
        { name: 'Max Liquid', category_id: 5, variants: [{name: '110 ml', price: 120}, {name: '275 ml', price: 280}, {name: '475 ml', price: 450}] },
        { name: 'Max Paste', category_id: 5, variants: [{name: '200 gm', price: 150}, {name: '400 gm', price: 280}] },
        { name: 'Safoon Dish Wash', category_id: 5, variants: [{name: 'Standard', price: 130}] },
        { name: 'Aj Dish Washer', category_id: 5, variants: [{name: '1.5 ltr', price: 350}] },
        { name: 'Scotch Brite', category_id: 5, variants: [{name: 'Small', price: 50}, {name: 'Regular', price: 80}] },
        { name: 'Spiral', category_id: 5, variants: [{name: 'Small', price: 40}, {name: 'Tar', price: 60}] },
        
        { name: 'Max Long Bar', category_id: 5, variants: [{name: 'Standard', price: 120}] },
        { name: 'Max 35', category_id: 5, variants: [{name: 'Standard', price: 35}] },
        { name: 'Max 60', category_id: 5, variants: [{name: 'Standard', price: 60}] },
        { name: 'Max 105', category_id: 5, variants: [{name: 'Standard', price: 105}] },
        { name: 'Max Longbar Double', category_id: 5, variants: [{name: '200 gm', price: 200}] },
        { name: 'Safoon Longbar', category_id: 5, variants: [{name: '80 gm', price: 80}] },

        // Personal Care (8) - Shampoos
        ...['Lifeboy Shampoo', 'Sunsilk Shampoo', 'Tresme Shampoo', 'Loreal Shampoo', 'Bio Amla Shampoo', 'Vatika Shampoo', 'Hello Hair Shampoo', 'Mclay Shampoo', 'Head & Shoulders', 'Pantene Shampoo', 'Conditioner Mclay'].map(name => ({
            name, category_id: 8, variants: [{name: '275 ml', price: 350 + Math.floor(Math.random()*100)}, {name: '345 ml', price: 450 + Math.floor(Math.random()*150)}, {name: '500 ml', price: 650 + Math.floor(Math.random()*200)}]
        })),

        // Personal Care (8) - Bath Soaps
        ...['Lifeboy Soap', 'Tibet Soap', 'Palmolive Soap', 'Safeguard Soap', 'Capri Soap', 'Lux Soap', 'Sufi Classic Soap', 'Laar Soap', 'Door Soap', 'Dove Soap'].map(name => ({
            name, category_id: 8, variants: [{name: 'Standard', price: 100 + Math.floor(Math.random()*50)}]
        })),

        // Noodle and Macaronis (10)
        { name: 'Knorr Family Pack', category_id: 10, variants: [{name: 'Chatpatta', price: 300}, {name: 'Chicken', price: 300}] },
        { name: 'Indomie Noodles', category_id: 10, variants: [{name: 'Standard', price: 80}] },
        
        { name: 'Aj Macroni', category_id: 10, variants: [{name: 'Elbow', price: 200}, {name: 'Double Elbow', price: 210}, {name: 'Spring', price: 200}, {name: 'Shell', price: 200}, {name: 'Mini Elbow', price: 200}] },
        { name: 'Bake Parlor', category_id: 10, variants: [{name: 'Spaghetti', price: 180}, {name: 'Macroni Box', price: 190}] },
        { name: 'Mario', category_id: 10, variants: [{name: 'Spaghetti 500gm', price: 170}, {name: 'Macroni 1kg pack', price: 300}] },
        { name: 'Elfin', category_id: 10, variants: [{name: 'Macroni Box', price: 160}, {name: 'Macroni 1kg Pouch', price: 280}] },
        { name: 'Golden Macroni Box', category_id: 10, variants: [{name: 'Standard', price: 150}] },
        { name: 'Colourful Vermicelli', category_id: 10, variants: [{name: 'Standard', price: 120}] }
    ];

    const stmt = db.prepare("INSERT INTO Products (name, category_id, price, stock, is_active, variants) VALUES (?, ?, ?, ?, ?, ?)");

    products.forEach(p => {
        const defaultPrice = p.variants[0].price;
        const stock = 10 + Math.floor(Math.random() * 90);
        const variantsJson = JSON.stringify(p.variants);
        stmt.run(p.name, p.category_id, defaultPrice, stock, 1, variantsJson, (err) => {
            if (err) console.error("Error inserting", p.name, err);
        });
    });

    stmt.finalize(() => {
        console.log("All products inserted.");
        db.close();
    });
}
