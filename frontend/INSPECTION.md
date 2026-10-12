# Dishcovery — Stage 1 inspection and setup

Runtime dataset: 3772 records; identifier: restaurant_id (string).
Boroughs: ['Bronx', 'Brooklyn', 'Manhattan', 'Queens', 'Staten Island']
Cuisines: ['CHINESE', 'INDIAN', 'ITALIAN', 'JAPANESE', 'MEXICAN', 'THAI']
Fields: address {building, coord, street, zipcode}, borough, cuisine, grades [{date, grade, score}], name, restaurant_id, Meals.

The runtime dataset is authoritative for existing behavior. restaurants-3.json is a separate inspection dataset with different cuisines; do not silently substitute it.

## Pages and behavior
- Home: hero, three daily seeded featured picks, three sum-score >90 picks, cuisine popups, sample dish sliders, restaurant detail popup, footer cursor glow.
- About: story, mission, team/signatures, marquee, closing logo; weighted wheel scrolling and header hide near outro.
- Restaurants: search recognizes cuisine/borough terms and remaining text, multiselect filters, score >90 switch, sorting, incremental results, detail popup and reviews; query state is reflected in URL.
- Favorites: six cuisine slides, arrows/dots/keyboard, stored favorites and detail popup.
- Reviews: one review per restaurant, star/text editing, validation, confirmed deletion and ?open= restaurant links.

## Shared behavior and storage
- Checkbox/label navigation menu; footer glow; :target popups and body:has(.modal:target) scroll lock.
- dishcovery.favorites: JSON array of string restaurant IDs, most recent first.
- dishcovery.reviews: JSON array of {rid,name,cuisine,borough,rating,text,ts}, one review per restaurant.
- Score = sum of grades[].score, strict >90. These are inspection-style records, not customer ratings. The existing Top rated label conflicts with that meaning. No labels changed in Stage 1; review required before later correction.

## Styles and assets
- Home/Restaurants/Favorites/Reviews order: style.css, restaurants.css, extras.css. About: style.css, about.css.
- Google Fonts: Barlow 400/500; Barlow Condensed 500/600/700; Space Mono; Mrs Saint Delafield; Reenie Beanie; Arizonia. No local font files supplied. External font access is required for the original typography.
- Original CSS copied byte-for-byte, including comments and animation-timeline rules. Static assets copied without modification.
- Bootstrap grid and utilities imported first. Full Bootstrap CSS deliberately excluded because it adds reboot, .btn and .modal behavior; this follows the grid/utilities-only requirement. Utilities sharing original class names still need rendered verification.
- smooth-scroll.js was supplied separately and inspected. It uses EASE=0.085 and SPEED=1, matching about.js. Its global wheel handler respects defaultPrevented, horizontal wheels, zoom, menu/page locks, inner scroll containers and reduced motion. about.js independently installs another wheel handler and animation loop without checking defaultPrevented. Loading both can apply scrolling twice. Stage 2 initialized smooth scrolling once through App.vue and retained About-specific header hiding with proper cleanup; the original scroll constants remain unchanged.
- Restaurant CRUD controls and explicit grouped results are absent. Their placement needs review before implementation.

## Video inventory
- chinese.mp4: 9,412,799 bytes (8.98 MiB).
- indian.mp4: 3,415,101 bytes (3.26 MiB).
- italian.mp4: 8,771,082 bytes (8.36 MiB).
- japanese.mp4: 8,439,437 bytes (8.05 MiB).
- mexican.mp4: 13,311,853 bytes (12.70 MiB).
- mont.mp4: 20,549,151 bytes (19.60 MiB).
- restaurants.mp4: 13,340,337 bytes (12.72 MiB).
- showcase.mp4: 99,232,200 bytes (94.64 MiB).
- showcases.mp4: 19,283,392 bytes (18.39 MiB).
- thai.mp4: 20,074,495 bytes (19.14 MiB).

Videos total about 206 MiB. No individual video exceeds GitHub’s 100 MiB file limit; the combined project is large for uploads and deployments. Consider external hosting or compression later, only with approval. No assets modified.

## Verification and boundaries
- Home and About are converted; Restaurants, Favorites and Reviews contents remain placeholders. Navbar, Footer, global scrolling and route behavior were completed in Stage 2. Home cards, modal and its data adapter are now included.
- Build result is recorded in README after validation. Desktop/mobile visual equivalence cannot be assessed until page conversion; no visual-equivalence claim is made.
- Backend source, Atlas connectivity, API integration, database persistence and MongoDB aggregation are not implemented or verified.

## Original file inventory (bytes; SHA-256)

- about.css: 22294; c7e8b8f79b4b562ce23ce6a2f5971448434db15db65f7c1dee3c7aeeeab7f5f2
- about.html: 15446; 5b086a4803fd7ca48bf380244b6b544cc6163e86e4268006e28e6b2860be0608
- about.js: 3201; 96aa8c7ae4d74cfab088617d16cd38be4b26e7f4c180ff86798099d5fa3999bb
- data/restaurants-data.js: 2386359; 7a69bb7e5cd776e8b7918c2f38c5ae14ad4a45e28d114951d147ca8bd6ba115e
- extras.css: 12959; beb793cc63adc15cad382195d43e15fa0bad1bc76f907cd8fa2f66619b850395
- favorites.html: 12733; 5da395f55accf4ec204de3e717e7ec344c51ec1d4ef07a9b48e2e2b812abc6b7
- favorites.js: 2239; 4d85b7831986fcc905151b876ceecb461c83c0f5fd43a37d73cb0d794edcfbfd
- home.js: 2852; 9d925ed0ee9bc43ee90df254c8ad89a2a3196f12ae0192a3ff60ee08fe5c9f55
- img/brent2.jpeg: 84273; 96f029e185efacaba0d58a85838881a34f28288a9322ccbe929d5dd318507269
- img/chinese-1.jpg: 166003; 8509cb76781d55fa29bafa132ed938de4190c4446245a7313272887c64467159
- img/chinese-2.jpg: 134928; 1dc5aa102f113cd6733686623f6ceff3e5088c95dd151f9e0367419dc2018948
- img/chinese-3.jpg: 222507; beb526170203e8970c7273ac5cd102bd3585ca37857a9180a5ea97c4d4ef7bab
- img/chinese-4.jpg: 152805; 98788cae05e0a491f634a0d7c37eb78b6d40885ba6baf3a2eb360609a8767154
- img/chinese-5.jpg: 246184; 7185e6aeaeaf1b23bdc80da4c8da5c72ad457e282562493672ff62e90caf2939
- img/chinese-6.jpg: 98025; 4173e63e701dcc790a7a312e8800078f4ca71430468d49eb06eafbb842d272ea
- img/chinese.jpg: 118093; add347f8633f6fe0601fdd43cbaa1bd0dd4e198c8f91e525743061db17060239
- img/daniel.jpg: 65804; 1c1b11b95f073f54348f26f7875dd29dce3eb237708352c8c51797c80e3ac1a5
- img/dish.png: 78782; 71c0008741dd96c49e6562afe8a86f9f3b1e246ef444192a943bf99377bc456c
- img/favchina.jpg: 1056650; 51a7219da9424d8bf24c5442b22ed02c29525c6845da510d4247ebc340a878b8
- img/favindia.jpg: 2294090; f4d13f52c76c8ac95ef3cebadc3ec8b4508c79116ca1d947a0c8c227820d8d27
- img/favitaly.jpg: 138131; ae1a716239d195366faf32038d3a7a623e29f6a8666bfa77de9672f3285ca5c0
- img/favjapan.jpg: 128640; fbb2c47d3980c51c95bfd1341c963e50823bac8593f46f3948cf93751cbf47d1
- img/favmexico.jpg: 247967; bde9bc2eef7a856b10ed48d702d8045ce393f49cfd1719200cb5dbb0edc347ac
- img/favthai.jpg: 3268143; 14fc8eefa77c34f617efe07855a35b498305884477a0ffab88792723176b577a
- img/india-1.jpg: 282458; d20c2849ef427d2cd2fe5e94537949e4928df818391ad99ce84bf65995689804
- img/india-2.jpg: 72298; 066ab037e3a615323ec38ef1d601db2fd111eba50d6cc5ba5c1eda5ec83fe8ba
- img/india-3.jpg: 198080; 04bdcf5846da9837f5b82bc26b9c061470daafd0d09de47270c2cd118c8a2c1e
- img/india-4.jpg: 143756; 13f3735ba66bc8b897f424daa933bf8bb538795a8704c7838cb7249a60505868
- img/india-5.jpg: 234570; 221af1b8b205710f6451d424bb3b2204910d5bd657ce6629c20be45801abea19
- img/india-6.jpg: 60175; 2ab9c8a5fd3dfd2d5566bf39b05ce8bfab60560584933d292f25f7d0cc7a34b0
- img/india.jpg: 155176; 09f5eb945102a7b26b9563ca828407e55d62ba2bebf03fcd24187dc12b097452
- img/italy-1.jpg: 129200; d05d9a6c4ba36cfe2ced6105593d47f742bc18d29c10103a5456ebd2e850f8ee
- img/italy-2.jpg: 123963; 8bb1b9194ab5634fbf452e01292d796687c5ac27970521b4d468044772e32527
- img/italy-3.jpg: 102374; 113761ae89a553a477618ffb09f9cb0ac6120c6450e4e1557e6650d05916b9a9
- img/italy-4.jpg: 173439; d1574e3173802fc7a4fd176144947f5c21ced235887129afa2ece321abae68bb
- img/italy-5.jpg: 136977; 662d2fdb484f6dd9546037a788113704e7d1b2a3226527126f2ef644a05b2a9a
- img/italy-6.jpg: 122045; 46eb512b595b9c9af38af443ae1f005512e3cc429b4454dfcb15efe2682410bf
- img/italy.jpg: 101167; 773e9807946d68bdef4d255f5494f21e4036042a31cc1284501358356d14aac9
- img/japan-1.jpg: 144173; 66cb6728d8caaa764751553b14994f97ef2b8f4e862d2fb8d6ca77fcd36ad48d
- img/japan-2.jpg: 153451; f7d8d236c97738dc54ac33e1cd5b078366a86bc1d839f8f5186cb030d2d5f595
- img/japan-3.jpg: 108777; 99b869ae7cae020a2230a15c0a9df7a0e01ec4527700d2e681fd03d27a6e50c8
- img/japan-4.jpg: 123274; da02e2f96c10a662a90068ac024016498478e72b996e7d955fc00f1623e45bd2
- img/japan-5.jpg: 74584; df4745738225d0f4e80d040b3376904a97ac059d61254b03507a1695356fc788
- img/japan-6.jpg: 185343; 317fa67d0bd100ea002aa53fb5a7aeb6f3a75184e8a3cb3ce6339010e666b489
- img/japan.jpg: 326562; bbd6cad58ad2cea158181aa39c69d9e42a643bbde70dc6da977af3ee1e2b4b5b
- img/justine.jpg: 189466; 7e5c648724039af7147f588cc2be5ef42930b334305fb5d9a7d016281a58bdc2
- img/ken.jpeg: 45211; 6161fb255bd029ca837667cd6883e9384034e84369b5323c441de797fddc3b46
- img/mexico-1.jpg: 149172; 6b01b5c7a37b1aa429702272890e58bf322b2b21f22fbedf1b2921ecc76a2771
- img/mexico-2.jpg: 149067; f67c4575bb2514849e630821881b720d16365e1f66e24e33c2defd2507fbe54a
- img/mexico-3.jpg: 172968; 3f4ac8a2793e9934dec47b9a6cd957a90249828bc50f54b0c5e759ed2b23c14e
- img/mexico-4.jpg: 289868; 3775e6e4eea191c723b3b1b5b0feab06bb39713909368b0a9b876bb93877a9b4
- img/mexico-5.jpg: 155369; 7176bcd679c86b658112615be43eab9418164dd3e1051a00be05b1e93ccabd6d
- img/mexico-6.jpg: 25680; c264d7fa72c7a140173b04fff30f1e594189d7eef3cf26f43397888e2016e60b
- img/mexico.jpg: 119000; ee6e2678e6612c93ae9a9fd45ae679cc70d3ee433e3f1cf0191c72ceb56f81d4
- img/signature-1.png: 15548; 5adbdc9737b294cbe2f23f7dd8af16cbcf06aad5a06d2cadb00eb2f67dcc50b7
- img/signature-2.png: 40706; 420c8798184c442e5496e667012991b045a360a9f6b2af2112b59f7ec532bd9b
- img/signature-3.png: 38983; 0a9c84e3484b46050946fa17973476143831c374e71a6664630effb7135d94af
- img/signature-4.png: 6887; e8a51c08ed46da9133c48c5fbe9c69da4cd42e6c7d8b12dd7bb4b94d4f06e0e2
- img/team.jpg: 110812; 21c9fe5c30dcd7f29251bc8d9616ca2efef91694ca7ec1761f1399c80a52f895
- img/thai-1.jpg: 249096; dfdb038e63431c3fff3c486a3934edf39fe3956136954e7dd0132037090ed450
- img/thai-2.jpg: 205222; 6c4d06b363afbbaed105ca8a37f2530fcf3bfbd2cd8a06feb7153f71b1bdfbb6
- img/thai-3.jpg: 132380; d0fb07adaab2ccaf8c33949020e10451d3afaa2b22c79f822f0d4e9ec4951053
- img/thai-4.jpg: 173589; f8723d50167708417290c327944af0652fa43eb6d90456b834f6d4337606590b
- img/thai-5.jpg: 148852; c20341d4d92707755deb3cd400bbfbc262fed63fddbb774e33790df7c4d32e7a
- img/thai-6.jpg: 154296; c2644f2c0faa9014dacca2eea68aab5f65724c67620f7ee0188d7e974a13ad5e
- img/thai.jpg: 153645; b22a8da53c0aa6deecd22aab39431bcc3793fa306c73ed10272506456be88cbf
- index.html: 42299; d34d163011f52c9836a270653536a1c78deebf1d70eb6065ecf9a8a86f2574d4
- modal.js: 6979; e4fa562b7fa58d0e4fe8746a6c5812a966f2c8357a51e9c03de61b11fea97dbf
- restaurants-3.json: 4151996; 769d77a7e922a2e0757e7b359b848fd77c073bfbdba65505de10f6939008046a
- restaurants.css: 18242; 769e8b18d377d1f0ca99e82c7e6e47782a0cb07e9eba2d669bd1bc62d3b03481
- restaurants.html: 14549; 38e68d8a50f36f984e60089eb4497130f09d12987fb8023dcd54fbec9bf75a4f
- restaurants.js: 16579; 22558f7719161f75c2350625580f07bdb79d46e7ae7ef7aea1793be1fea1b322
- reviews.html: 9569; 9b1e9ee315fe5a0c865efe164f6b8850e9aeba06b7bb43d1338d5f563e3b9166
- reviews.js: 4115; 5616786548707ad70952fcd3e43bf823d978a766599446e27c589fa5b2abf7db
- shared.js: 8039; 632662b00f67fde4dbce3b9b786d8e9ad8a90cd8c51a717e92d7110fead116c5
- style.css: 32105; 98ad7e93ee400f65ced47902edabb3445a00d8e71ba1b31737d7e50d23faeb68
- video/chinese.mp4: 9412799; eb25aa267287dc4d97cf1332b764073764038a8f12a49095b507f88319be5024
- video/indian.mp4: 3415101; 85d2b6fa2f67e2c908df34835e736b8410faa6a16c8575dc0489c202f85229dd
- video/italian.mp4: 8771082; 0a1ba331da7cdcf6bb50e1146cb34222155eec0edcc4ca3a4876632a557a48b3
- video/japanese.mp4: 8439437; 0ef37b8438dff2ffaad198f91b2e42872ed60698ae31a1ea138ab151ebb0df2a
- video/mexican.mp4: 13311853; 4f0ff29815cef1966a0f6b1d0a35db008ae49ab6573e8e6f8bb35ac2e218f87d
- video/mont.mp4: 20549151; 7ab63691e147fc6fa0b64ce84181db69a3b0551e094f11cd6a8b7388a767d6d5
- video/restaurants.mp4: 13340337; eae1add8433d06c087ad1dffc834b249887dea7d4f5bf42f714dd86c66f9c6ca
- video/showcase.mp4: 99232200; 870f1622470490ad0f799d8e890a64858577568e0b62734246f57cd15da7039f
- video/showcases.mp4: 19283392; bb01b84610b854865dec40b3c18fa91f398e555edabe5dce8758737177cd0f8c
- video/thai.mp4: 20074495; 604a752b8c22fd6d9263a1d30154ca74955f8d897f426e4fc4855111fc50e449

## Missing original references
All five pages reference img/social-facebook.svg, img/social-instagram.svg, img/social-linkedin.svg, img/social-x.svg and img/social-youtube.svg. These were not supplied. The "..." asset-path example occurs inside comments, not a live reference. Preserve/document rather than invent replacements. User confirmed these icons are not visible in the original website; preserve the current footer appearance without adding social images. They do not block conversion.

Additional original file: smooth-scroll.js; 3822 bytes; SHA-256 e84077aead47cc0507f98d458603886e2910d09b7b9da70f69d72b3c3f768324. Original script and comments preserved. No listener integration performed in Stage 1.
