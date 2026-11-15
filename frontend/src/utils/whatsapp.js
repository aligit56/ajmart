export const generateWhatsAppLink = (order, userDetails, customPhone = null) => {
    // Aqib (Official Store Seller & Wholesale Desk): 0335-7727555
    let cleanPhone = (customPhone || "923357727555").toString().replace(/\D/g, '');
    if (cleanPhone.startsWith('03')) {
        cleanPhone = '92' + cleanPhone.slice(1);
    }
    const storePhone = cleanPhone || "923357727555";
    
    let message = `*NEW ORDER - AJMart* 🛒\n\n`;
    message += `*Customer:* ${userDetails.name}\n`;
    message += `*Phone:* ${userDetails.phone}\n`;
    message += `*Delivery Address:* ${userDetails.address}\n\n`;
    message += `*ORDER ITEMS:*\n`;
    
    order.items.forEach((item, index) => {
        const variantText = item.variant_name ? ` [${item.variant_name}]` : '';
        message += `${index + 1}. ${item.name}${variantText} (x${item.quantity}) - Rs ${item.price * item.quantity}\n`;
    });
    
    message += `\n*TOTAL AMOUNT: Rs ${order.total_price}*\n`;
    if (userDetails.notes) message += `\n*Customer Notes:* ${userDetails.notes}\n`;
    message += `\n_Order placed on AJMart Web Store_`;
    
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${storePhone}?text=${encodedMessage}`;
};
