// Adaptation du composant InfiniteScroll pour l'environnement HTML/JS simple
const InfiniteScroll = ({
  width = "30rem",
  maxHeight = "100%",
  negativeMargin = "-0.5em",
  items = [],
  itemMinHeight = 150,
  isTilted = false,
  tiltDirection = "left",
  autoplay = false,
  autoplaySpeed = 0.5,
  autoplayDirection = "down",
  pauseOnHover = false,
}) => {
  const wrapperRef = React.useRef(null);
  const containerRef = React.useRef(null);

  const getTiltTransform = () => {
    if (!isTilted) return "none";
    return tiltDirection === "left"
      ? "rotateX(20deg) rotateZ(-20deg) skewX(20deg)"
      : "rotateX(20deg) rotateZ(20deg) skewX(-20deg)";
  };

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (items.length === 0) return;

    const divItems = gsap.utils.toArray(container.children);
    if (!divItems.length) return;

    const firstItem = divItems[0];
    const itemStyle = getComputedStyle(firstItem);
    const itemHeight = firstItem.offsetHeight;
    const itemMarginTop = parseFloat(itemStyle.marginTop) || 0;
    const totalItemHeight = itemHeight + itemMarginTop;
    const totalHeight = (itemHeight * items.length) + (itemMarginTop * (items.length - 1));

    const wrapFn = gsap.utils.wrap(-totalHeight, totalHeight);

    divItems.forEach((child, i) => {
      const y = i * totalItemHeight;
      gsap.set(child, { y });
    });

    const observer = Observer.create({
      target: container,
      type: "wheel,touch,pointer",
      preventDefault: true,
      onPress: ({ target }) => {
        target.style.cursor = "grabbing";
      },
      onRelease: ({ target }) => {
        target.style.cursor = "grab";
      },
      onChange: ({ deltaY, isDragging, event }) => {
        const d = event.type === "wheel" ? -deltaY : deltaY;
        const distance = isDragging ? d * 5 : d * 10;
        divItems.forEach((child) => {
          gsap.to(child, {
            duration: 0.5,
            ease: "expo.out",
            y: `+=${distance}`,
            modifiers: {
              y: gsap.utils.unitize(wrapFn)
            }
          });
        });
      }
    });

    let rafId;
    if (autoplay) {
      const directionFactor = autoplayDirection === "down" ? 1 : -1;
      const speedPerFrame = autoplaySpeed * directionFactor;

      const tick = () => {
        divItems.forEach((child) => {
          gsap.set(child, {
            y: `+=${speedPerFrame}`,
            modifiers: {
              y: gsap.utils.unitize(wrapFn)
            }
          });
        });
        rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);

      if (pauseOnHover) {
        const stopTicker = () => rafId && cancelAnimationFrame(rafId);
        const startTicker = () => (rafId = requestAnimationFrame(tick));

        container.addEventListener("mouseenter", stopTicker);
        container.addEventListener("mouseleave", startTicker);

        return () => {
          observer.kill();
          stopTicker();
          container.removeEventListener("mouseenter", stopTicker);
          container.removeEventListener("mouseleave", startTicker);
        };
      } else {
        return () => {
          observer.kill();
          rafId && cancelAnimationFrame(rafId);
        };
      }
    }

    return () => {
      observer.kill();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [
    items,
    autoplay,
    autoplaySpeed,
    autoplayDirection,
    pauseOnHover,
    isTilted,
    tiltDirection,
    negativeMargin
  ]);

  return (
    <>
      <style>
        {`
        .infinite-scroll-wrapper {
          max-height: ${maxHeight};
        }

        .infinite-scroll-container {
          width: ${width};
        }

        .infinite-scroll-item {
          height: ${itemMinHeight}px;
          margin-top: ${negativeMargin};
        }
        `}
      </style>

      <div className="infinite-scroll-wrapper" ref={wrapperRef}>
        <div
          className="infinite-scroll-container"
          ref={containerRef}
          style={{
            transform: getTiltTransform(),
          }}
        >
          {items.map((item, i) => (
            <div
              className='infinite-scroll-item'
              key={i}
            >
              {item.content}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// Création des éléments pour le composant InfiniteScroll avec les photos
const PhotoGallery = () => {
  // Liste des photos du dossier
  const photoItems = [
    { id: 1, path: "photos/image00001.jpg" },
    { id: 2, path: "photos/image00002.jpg" },
    { id: 3, path: "photos/image00003.jpg" },
    { id: 4, path: "photos/image00004.jpg" },
    { id: 5, path: "photos/image00005.jpg" },
    { id: 6, path: "photos/image00006.jpg" },
    { id: 7, path: "photos/image00007.jpg" },
    { id: 8, path: "photos/image00008.jpg" },
    { id: 9, path: "photos/image00009.jpg" },
    { id: 10, path: "photos/image00010.jpg" },
    { id: 11, path: "photos/image00011.jpg" },
    { id: 12, path: "photos/image00012.jpg" },
    { id: 13, path: "photos/image00013.jpg" },
    { id: 14, path: "photos/image00014.jpg" },
    { id: 15, path: "photos/image00015.jpg" },
    { id: 16, path: "photos/image00016.jpg" },
    { id: 17, path: "photos/image00017.jpg" },
    { id: 18, path: "photos/image00018.jpg" }
  ];

  // Création des items pour le composant InfiniteScroll
  const scrollItems = photoItems.map(photo => ({
    content: <img src={photo.path} alt={`Photo ${photo.id}`} />
  }));

  return (
    <div className="photo-gallery" data-aos="fade-up" data-aos-delay="300">
      <h3>Mes Photos Prises</h3>
      <p className="gallery-description">Découvrez une sélection de mes meilleures photographies en défilement interactif.</p>
      <InfiniteScroll 
        width="100%" 
        maxHeight="600px"
        items={scrollItems}
        itemMinHeight={300}
        isTilted={true}
        tiltDirection="left"
        autoplay={true}
        autoplaySpeed={0.3}
        autoplayDirection="down"
        pauseOnHover={true}
      />
    </div>
  );
};

// Rendu du composant dans le conteneur
console.log("Chargement du composant React...");
console.log("Élément cible:", document.getElementById('react-infinite-scroll'));

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM chargé, tentative de rendu du composant...");
  console.log("Élément cible après chargement:", document.getElementById('react-infinite-scroll'));
  
  try {
    ReactDOM.render(
      <PhotoGallery />,
      document.getElementById('react-infinite-scroll')
    );
    console.log("Rendu du composant réussi!");
  } catch (error) {
    console.error("Erreur lors du rendu du composant:", error);
  }
}); 