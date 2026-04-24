# Graph Report - .  (2026-04-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 87 nodes · 120 edges · 27 communities detected
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]

## God Nodes (most connected - your core abstractions)
1. `updateUI()` - 13 edges
2. `useApp()` - 12 edges
3. `remove()` - 10 edges
4. `add()` - 8 edges
5. `openCart()` - 8 edges
6. `Map()` - 8 edges
7. `calcOngkir()` - 5 edges
8. `handleAuthStateChanged()` - 5 edges
9. `setPos()` - 4 edges
10. `show()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `useApp()` --calls--> `Home()`  [INFERRED]
  /Users/ferinapratiwi/page/src/context/AppContext.js → /Users/ferinapratiwi/page/src/app/page.js
- `useApp()` --calls--> `Navbar()`  [INFERRED]
  /Users/ferinapratiwi/page/src/context/AppContext.js → /Users/ferinapratiwi/page/src/components/Navbar.js
- `useApp()` --calls--> `ProductCard()`  [INFERRED]
  /Users/ferinapratiwi/page/src/context/AppContext.js → /Users/ferinapratiwi/page/src/components/Catalog.js
- `useApp()` --calls--> `LoyaltyCard()`  [INFERRED]
  /Users/ferinapratiwi/page/src/context/AppContext.js → /Users/ferinapratiwi/page/src/components/LoyaltyCard.js
- `useApp()` --calls--> `AuthModal()`  [INFERRED]
  /Users/ferinapratiwi/page/src/context/AppContext.js → /Users/ferinapratiwi/page/src/components/AuthModal.js

## Communities

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (8): closeAuth(), dismissPWA(), go(), handleAuthStateChanged(), installPWA(), mergePoints(), syncPoints(), updateActiveTab()

### Community 1 - "Community 1"
Cohesion: 0.18
Nodes (17): calcOngkir(), calculateRedeem(), closeLogout(), closeTerms(), confirmLogout(), hide(), initMap(), initOfflineHandling() (+9 more)

### Community 2 - "Community 2"
Cohesion: 0.29
Nodes (7): add(), fly(), logout(), openAuth(), openTerms(), peek(), show()

### Community 3 - "Community 3"
Cohesion: 0.29
Nodes (4): Catalog(), ProductCard(), Map(), AdminPage()

### Community 4 - "Community 4"
Cohesion: 0.6
Nodes (4): useApp(), CartSheet(), CartView(), ProductPeek()

### Community 5 - "Community 5"
Cohesion: 1.0
Nodes (0): 

### Community 6 - "Community 6"
Cohesion: 1.0
Nodes (0): 

### Community 7 - "Community 7"
Cohesion: 1.0
Nodes (1): AuthModal()

### Community 8 - "Community 8"
Cohesion: 1.0
Nodes (1): Navbar()

### Community 9 - "Community 9"
Cohesion: 1.0
Nodes (1): Hero()

### Community 10 - "Community 10"
Cohesion: 1.0
Nodes (1): LoyaltyCard()

### Community 11 - "Community 11"
Cohesion: 1.0
Nodes (1): Home()

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

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 5`** (2 nodes): `fetchMembers()`, `admin.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 6`** (2 nodes): `RootLayout()`, `layout.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (2 nodes): `AuthModal()`, `AuthModal.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (2 nodes): `Navbar()`, `Navbar.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (2 nodes): `Hero()`, `Hero.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (2 nodes): `LoyaltyCard()`, `LoyaltyCard.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (2 nodes): `Home()`, `page.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (2 nodes): `AppProvider()`, `AppContext.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (2 nodes): `Scripts()`, `Scripts.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (1 nodes): `next.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (1 nodes): `eslint.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (1 nodes): `OneSignalSDKWorker.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (1 nodes): `OneSignalSDKUpdaterWorker.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (1 nodes): `sw.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `generate-config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `OneSignalSDKWorker.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `OneSignalSDKUpdaterWorker.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `config.example.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `sw.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `firebase.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `products.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Map()` connect `Community 3` to `Community 1`, `Community 2`, `Community 4`?**
  _High betweenness centrality (0.285) - this node is a cross-community bridge._
- **Why does `useApp()` connect `Community 4` to `Community 3`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`?**
  _High betweenness centrality (0.221) - this node is a cross-community bridge._
- **Why does `openCart()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `useApp()` (e.g. with `Home()` and `AdminPage()`) actually correct?**
  _`useApp()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._