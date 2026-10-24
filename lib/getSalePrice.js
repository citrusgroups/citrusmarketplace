export const getSalePrice = (product, settings) => {
    const saleActive =
        settings?.flashSaleEnabled &&
        new Date() >= new Date(settings?.flashSaleStartTime) &&
        new Date() <= new Date(settings?.flashSaleEndTime);

    if (saleActive && product.isFlashSale) {
        return Math.round((Number(product.basePrice) - (Number(product.basePrice) * settings.flashSaleDiscountPercent) / 100) * 100) / 100;
    }

    return Number(product.basePrice);
};