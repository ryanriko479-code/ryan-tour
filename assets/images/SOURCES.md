# Image assets

This prototype references photography directly from Unsplash by URL
(see the `img` fields in `src/services/mockData.js`) rather than
shipping binary files, so there's nothing meaningful to commit here
yet — these folders exist to match the target architecture:

```
assets/images/parks/           amboseli-1.jpg, amboseli-2.jpg, mara-1.jpg, ...
assets/images/accommodations/  amboseli-lodge-1.jpg, mara-lodge-1.jpg, ...
assets/images/packages/        hero-bg.jpg
```

When you're ready to self-host imagery:

1. Drop optimized JPEGs (WebP preferred, <200KB each) into the
   matching subfolder using the filenames above.
2. Update the corresponding `img` field in `mockData.js` to a
   relative path, e.g. `assets/images/parks/amboseli-1.jpg`.
3. No component or page code needs to change — every image reference
   flows through `mockData.js` → `api.js` → `dataLoader.js`.
