export const getUnlockedCategories = () => {
  const saved = localStorage.getItem('wordless_purchases');
  const unlocked = saved ? JSON.parse(saved) : [];
  // Ensure we don't return duplicates and include the free one
  return Array.from(new Set(['Everyday Things', ...unlocked]));
};

export const savePurchase = (category: string) => {
  const saved = localStorage.getItem('wordless_purchases');
  const unlocked = saved ? JSON.parse(saved) : [];
  if (!unlocked.includes(category)) {
    unlocked.push(category);
    localStorage.setItem('wordless_purchases', JSON.stringify(unlocked));
  }
};
