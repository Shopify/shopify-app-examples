export function productViewURL({host, productHandle, discountCode}) {
	const url = new URL(`https://${host}`);
	const productPath = `/products/${productHandle}`;

	if (discountCode) {
		url.pathname = `/discount/${discountCode}`;
		url.searchParams.append("redirect", productPath);
	} else {
		url.pathname = productPath;
	}

	return url.toString();
}

export function productCheckoutURL({host, variantId, quantity = 1, discountCode}) {
	const url = new URL(`https://${host}`);
	const id = variantId.replace(
		/gid:\/\/shopify\/ProductVariant\/([0-9]+)/,
		"$1"
	);

	url.pathname = `/cart/${id}:${quantity}`;

	if (discountCode) {
		url.searchParams.append("discount", discountCode);
	}


	return url.toString();
}