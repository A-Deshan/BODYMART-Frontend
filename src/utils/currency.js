const currencyFormatter = new Intl.NumberFormat('en-LK', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export function formatCurrency(value) {
  return `Rs. ${currencyFormatter.format(Number(value || 0))}`;
}
