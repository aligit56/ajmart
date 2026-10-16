const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
    db.all(`SELECT name FROM sqlite_master WHERE type='table';`, (err, tables) => {
        console.log('Tables:', tables);
    });
    
    db.all(`SELECT id, name FROM Categories`, (err, categories) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return;
        }
        console.log('\n--- Categories ---');
        console.log(categories);
        
        db.all(`SELECT category_id, COUNT(*) as product_count FROM products GROUP BY category_id`, (err, productCounts) => {
            if (err) {
                console.error('Error fetching product counts:', err);
                return;
            }
            console.log('\n--- Products Count per Category ---');
            console.log(productCounts);

            db.all(`SELECT * FROM products`, (err, products) => {
                if (err) {
                    console.error('Error fetching products:', err);
                    return;
                }
                
                console.log('\n--- Missing Actual Products ---');
                // Analysis logic
                // For each category, see if they have actual products with actual rates (not dummy ones)
                categories.forEach(category => {
                    const categoryProducts = products.filter(p => p.category_id === category.id);
                    
                    if (categoryProducts.length === 0) {
                        console.log(`Category [${category.name}] has NO products at all.`);
                    } else {
                        // Check if products look like dummy ones (e.g. price is 0, or name has 'dummy', or description is missing, or actual rates are not set)
                        const actualProducts = categoryProducts.filter(p => {
                            // Dummy detection logic
                            const isDummyName = p.name.toLowerCase().includes('dummy') || p.name.toLowerCase().includes('test');
                            const isZeroPrice = p.price === 0 || p.price === "0" || p.price == null;
                            const isPlaceholderImg = !p.image_url || p.image_url.includes('placeholder');
                            // Let's assume an actual product has price > 0 and not a dummy name
                            return !isDummyName && !isZeroPrice;
                        });
                        
                        if (actualProducts.length === 0) {
                            console.log(`Category [${category.name}] only has dummy products (Total: ${categoryProducts.length}).`);
                        } else {
                            console.log(`Category [${category.name}] has ${actualProducts.length} actual products.`);
                            // Optionally, print a couple of them
                            // console.log(actualProducts.slice(0, 2));
                        }
                    }
                });
            });
        });
    });
});
