# Graph Report - /Users/ferinapratiwi/page  (2026-04-24)

## Corpus Check
- 25 files · ~271,430 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 85 nodes · 117 edges · 20 communities detected
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]

## God Nodes (most connected - your core abstractions)
1. `updateUI()` - 13 edges
2. `remove()` - 10 edges
3. `useApp()` - 9 edges
4. `add()` - 8 edges
5. `openCart()` - 8 edges
6. `Map()` - 8 edges
7. `calcOngkir()` - 5 edges
8. `handleAuthStateChanged()` - 5 edges
9. `setPos()` - 4 edges
10. `show()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Catalog()` --calls--> `Map()`  [INFERRED]
  /Users/ferinapratiwi/page/src/components/Catalog.js → /Users/ferinapratiwi/page/src/components/Map.js
- `initMap()` --calls--> `Map()`  [INFERRED]
  /Users/ferinapratiwi/page/vanilla-backup/script.js → /Users/ferinapratiwi/page/src/components/Map.js
- `peek()` --calls--> `Map()`  [INFERRED]
  /Users/ferinapratiwi/page/vanilla-backup/script.js → /Users/ferinapratiwi/page/src/components/Map.js
- `openCart()` --calls--> `Map()`  [INFERRED]
  /Users/ferinapratiwi/page/vanilla-backup/script.js → /Users/ferinapratiwi/page/src/components/Map.js
- `useApp()` --calls--> `Home()`  [INFERRED]
  /Users/ferinapratiwi/page/src/context/AppContext.js → /Users/ferinapratiwi/page/src/app/page.js

## Communities

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (8): closeAuth(), dismissPWA(), go(), handleAuthStateChanged(), installPWA(), mergePoints(), syncPoints(), updateActiveTab()

### Community 1 - "Community 1"
Cohesion: 0.13
Nodes (10): useApp(), AuthModal(), CartSheet(), CartView(), ProductPeek(), LoyaltyCard(), Map(), Navbar() (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.18
Nodes (17): calcOngkir(), calculateRedeem(), closeLogout(), closeTerms(), confirmLogout(), hide(), initMap(), initOfflineHandling() (+9 more)

### Community 3 - "Community 3"
Cohesion: 0.29
Nodes (7): add(), fly(), logout(), openAuth(), openTerms(), peek(), show()

### Community 4 - "Community 4"
Cohesion: 0.67
Nodes (1): Catalog()

### Community 5 - "Community 5"
Cohesion: 1.0
Nodes (0): 

### Community 6 - "Community 6"
Cohesion: 1.0
Nodes (0): 

### Community 7 - "Community 7"
Cohesion: 1.0
Nodes (0): 

### Community 8 - "Community 8"
Cohesion: 1.0
Nodes (0): 

### Community 9 - "Community 9"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 5`** (2 nodes): `fetchMembers()`, `admin.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 6`** (2 nodes): `RootLayout()`, `layout.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (2 nodes): `Scripts()`, `Scripts.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (2 nodes): `Hero()`, `Hero.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (1 nodes): `next.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (1 nodes): `eslint.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (1 nodes): `sw.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (1 nodes): `generate-config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (1 nodes): `OneSignalSDKWorker.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (1 nodes): `config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (1 nodes): `OneSignalSDKUpdaterWorker.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (1 nodes): `config.example.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (1 nodes): `sw.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (1 nodes): `firebase.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `products.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Map()` connect `Community 1` to `Community 2`, `Community 3`, `Community 4`?**
  _High betweenness centrality (0.287) - this node is a cross-community bridge._
- **Why does `openCart()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `useApp()` (e.g. with `Home()` and `AdminPage()`) actually correct?**
  _`useApp()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._