export const getSalePrice = (product, settings) => {
    const saleActive =
        settings?.flashSaleEnabled &&
        new Date() >= new Date(settings?.flashSaleStartTime) &&
        new Date() <= new Date(settings?.flashSaleEndTime);

    if (saleActive && product.isFlashSale) {
        return Math.round(
            product.basePrice -
            (product.basePrice * settings.flashSaleDiscountPercent) / 100
        );
    }

    return product.basePrice;
};