export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  readTime: string;
  tag: string;
  body: string[];
};

export const posts: Post[] = [
  {
    slug: "cut-checkout-queues",
    title: "Five ways to cut checkout queues in a busy grocery store",
    excerpt:
      "Long queues cost more sales than empty shelves. Here is how fast-moving stores keep billing under thirty seconds per customer.",
    date: "2026-08-28",
    author: "Ananya Rao",
    readTime: "6 min read",
    tag: "Operations",
    body: [
      "Queues form long before the counter. In most grocery stores the bottleneck is not the cashier's speed but the small delays that stack up: a missing barcode, a price nobody is sure about, a payment method that takes three attempts.",
      "Start by fixing your product master. Every item that sells more than once a week should have a barcode, a fixed selling price and a unit that the cashier does not have to think about. When a price lives in someone's head, billing stops.",
      "Second, keep the top hundred fast movers on a quick-select screen. In a typical supermarket these items make up more than half of all lines billed, and searching for them by name is pure lost time.",
      "Third, settle payment while the bill is still being packed. Splitting scanning from collection lets two people work on one customer instead of one person doing both jobs in sequence.",
      "Fourth, print less. A shorter receipt prints faster and customers rarely read the fine print anyway. Keep the store name, the items, the tax summary and the total.",
      "Finally, measure. Note how many bills you raise in your busiest hour this week, change one thing, and check the number again next week. Queue length is a habit, and habits only change when someone is counting.",
    ],
  },
  {
    slug: "stock-counts-that-stick",
    title: "Stock counts that actually stick",
    excerpt:
      "A full shutdown count once a year tells you very little. Rolling counts by category keep your numbers honest all year round.",
    date: "2026-08-12",
    author: "Vikram Shetty",
    readTime: "5 min read",
    tag: "Inventory",
    body: [
      "Annual stock takes are exhausting, disruptive and out of date within a week. The alternative is counting a small slice of the store every day, so that every category is touched at least once a month.",
      "Pick categories by value, not by shelf order. Dairy, oils and packaged staples move fast and drift quickly. Cleaning supplies can wait a quarter.",
      "Record the difference, not just the correction. A category that loses two percent every month is telling you something about spillage, theft or receiving errors, and the pattern only shows up when you keep the history.",
      "When a count is corrected, write the reason. Six months later a bare adjustment means nothing, but 'damaged in transit' turns into a supplier conversation.",
      "The goal is not a perfect number. It is a number you trust enough to reorder from without walking to the back room to check.",
    ],
  },
  {
    slug: "pricing-margin-basics",
    title: "Margin basics every store owner should recheck",
    excerpt:
      "Gross margin, net margin and the quiet costs in between — a plain-language refresher for retail owners.",
    date: "2026-07-30",
    author: "Ananya Rao",
    readTime: "7 min read",
    tag: "Finance",
    body: [
      "Gross margin is what is left after you pay for the goods. Net margin is what is left after you pay for everything else: rent, salaries, electricity, packaging, transport and the losses you would rather not think about.",
      "Most grocery owners know their gross margin by category and almost none know it by product. That gap is where money quietly disappears, because a single heavily discounted staple can absorb the profit of an entire aisle.",
      "Track your expenses in the same system you track your sales. A profit figure assembled from two different notebooks at the end of the month is a guess.",
      "Review your slowest twenty products every quarter. Shelf space is your scarcest asset, and an item that turns twice a year is renting it for free.",
      "Raising a price by two percent usually does more for net profit than cutting a cost by two percent, because the cost base is bigger and harder to move. Test it on a small set of items first.",
    ],
  },
  {
    slug: "supplier-relationships",
    title: "Getting better terms from your suppliers",
    excerpt:
      "Credit days, return policy and delivery reliability are negotiable — if you bring data to the conversation.",
    date: "2026-07-09",
    author: "Meera Iyer",
    readTime: "4 min read",
    tag: "Purchasing",
    body: [
      "Suppliers respond to volume and to predictability. If you can show twelve months of purchase history by value, you are negotiating from a different position than a store owner working from memory.",
      "Ask for three things in order: reliable delivery windows, a clear return policy for damaged or near-expiry goods, and then credit days. Reliability is worth more than a small discount you have to chase.",
      "Consolidate where it is safe to do so. Two dependable suppliers in a category usually beat five occasional ones, both for price and for the time you spend following up.",
      "Keep a record of every short delivery. It is uncomfortable to raise once and easy to raise when you have a list.",
    ],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
