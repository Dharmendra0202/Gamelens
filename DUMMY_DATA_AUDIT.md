# Dummy Data Audit

Audit of hardcoded/dummy data removed and replaced with empty typed state.
All empty initializers carry a `// TODO(backend):` comment.

| File                      | Type                      | Value Preview                         | Replacement                                     |
| ------------------------- | ------------------------- | ------------------------------------- | ----------------------------------------------- |
| app/(tabs)/home.tsx       | Profile                   | "Dharmendra Vishwakarma", phone, role | Empty `initialProfile`, loads from LocalStorage |
| app/(tabs)/home.tsx       | Feed posts                | 14 hardcoded posts (Rahul, Priya...)  | `useState<FeedPost[]>([])`                      |
| app/(tabs)/home.tsx       | Community users           | VK/RS/MS avatars                      | `CommunityUser[] = []`                          |
| app/(tabs)/home.tsx       | Popular players           | Virat/Dhoni/Rohit/Bumrah              | `PopularPlayer[] = []`                          |
| app/(tabs)/home.tsx       | Discovery matches         | 6 fixtures w/ stadiums                | `DiscoveryMatch[] = []`                         |
| app/(tabs)/home.tsx       | Store products            | 6 products w/ prices                  | `StoreProduct[] = []`                           |
| app/(tabs)/my-cricket.tsx | Matches                   | filter lists                          | `getMatchesByFilter` returns `[]`               |
| app/(tabs)/my-cricket.tsx | Tournaments               | search list                           | `allTournaments: TournamentItem[] = []`         |
| app/(tabs)/my-cricket.tsx | Points table              | qualified rows                        | empty typed array                               |
| app/(tabs)/my-cricket.tsx | Leaderboards              | top batsmen/bowlers                   | empty typed arrays                              |
| app/(tabs)/my-cricket.tsx | Recent teams              | Mumbai Warriors...                    | empty typed array                               |
| app/(tabs)/my-cricket.tsx | Squad rosters             | batting/bowling players               | `[]`                                            |
| app/(tabs)/looking.tsx    | Feed posts                | Aman XI, Rohit, Night Riders          | `initialPosts: Post[] = []`                     |
| app/(tabs)/community.tsx  | Feed posts                | Rahul/Priya/Vikas                     | `useState<CricketPost[]>([])`                   |
| app/(tabs)/community.tsx  | Groups                    | Mumbai CC, Weekend Warriors           | `Group[] = []`                                  |
| app/(tabs)/community.tsx  | Suggested groups + events | IPL Fans, static events               | removed, EmptyState added                       |
| app/(tabs)/store.tsx      | Products                  | 8 products                            | `Product[] = []`                                |
| app/(tabs)/store.tsx      | Featured deals            | Summer Sale, New Arrivals             | `FeaturedDeal[] = []`                           |
| app/(tabs)/store.tsx      | Cart count                | `useState(3)`                         | `useState(0)`                                   |

## Empty States

`components/EmptyState.tsx` is rendered where lists are empty: store products,
community feed/groups/events, looking feed. Home sections render nothing when
empty (scroll containers).

## Notes

- Category filter chips, ball/pitch selectors, and tab labels are UI labels, not
  data — kept as-is.
- Scoring state-machine logic in my-cricket.tsx is unchanged; only initial data
  values were stripped.
