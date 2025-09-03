import React, { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { Observer } from "gsap/Observer";
import "../Style/Component.scss";

// Register GSAP plugins
gsap.registerPlugin(Draggable, InertiaPlugin, Observer);

const QuickNav = ({ showcases, currentIndex, onSelect, onClose }) => {
  const modalRef = useRef(null);
  const carouselRef = useRef(null);
  const contentRef = useRef(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    // Wait for the DOM to be ready
    const slides = gsap.utils.toArray(".carousel-item");
    const prev = document.querySelector(".prev");
    const next = document.querySelector(".next");
    let activeSlide;
    let pointerDown;
    let firstRun = true;
    let observer;

    // override CSS to prevent native scrolling
    gsap.set(".carousel-container", { "overflow": "visible", "scroll-snap-type": "none" });

    // create seamless horizontal loop
    const loop = horizontalLoop(slides, {
      paused: true, // no auto-scroll
      paddingRight: 16, // match the 16px flex gap
      center: true, // snap the active slide to the center
      draggable: true, // requires Draggable & InertiaPlugin
      onPress: () => {
        // horizontalLoop() was customized to handle this callback
        pointerDown = true;
        gsap
          .timeline({ defaults: { overwrite: "auto", ease: "expo" } })
          .to(".carousel-container", { scale: 0.95 }, 0)
          .to(".carousel-item", { opacity: 1 }, 0)
          .to(".carousel-item-content", { scale: 0.95 }, 0)
          .to(".carousel-item img", { scale: 1.1 }, 0);
      },
      onRelease: () => {
        // horizontalLoop() was customized to handle this callback
        pointerDown = false;
        showActive();
      },
      onChange: (slide, index) => {
        // called when the active slide changes
        if (activeSlide) {
          activeSlide.classList.remove("active");
        }
        slide.classList.add("active");
        activeSlide = slide;
        if (!pointerDown) showActive();
      },
    });

    // prev / next button behavior
    function arrowBtnOver(e) {
      gsap.to(e.target, { opacity: 0.4 });
    }
    function arrowBtnOut(e) {
      gsap.to(e.target, { opacity: 1 });
    }

    next.addEventListener("pointerover", arrowBtnOver);
    next.addEventListener("pointerout", arrowBtnOut);
    next.addEventListener("click", () => loop.next({ duration: 1, ease: "expo" }));

    prev.addEventListener("pointerover", arrowBtnOver);
    prev.addEventListener("pointerout", arrowBtnOut);
    prev.addEventListener("click", () => loop.previous({ duration: 1, ease: "expo" }));

    // each slide can function as a button to activate itself
    slides.forEach((slide, i) => {
      slide.addEventListener("click", () => {
        if (!pointerDown) {
          const originalIndex = parseInt(slide.dataset.originalIndex);
          onSelect(originalIndex);
        }
      });
    });

    // Add scroll wheel functionality
    observer = Observer.create({
      target: window,
      type: "wheel,touch,pointer",
      wheelSpeed: 1,
      onDown: () => {
        if (!pointerDown) {
          loop.next({ duration: 0.25, ease: "power2.out" });
        }
      },
      onUp: () => {
        if (!pointerDown) {
          loop.previous({ duration: 0.25, ease: "power2.out" });
        }
      },
      tolerance: 10,
      preventDefault: true,
    });

    // set initial opacity for slides
    // gsap.set(".carousel-item", { opacity: i => (i === 0 ? 1 : 0.3) });

    // center on current showcase
    // Use a small delay to ensure DOM is fully rendered
    setTimeout(() => {
      loop.toIndex(currentIndex, { duration: 0 });
      // Also update the active slide class
      if (activeSlide) {
        activeSlide.classList.remove("active");
      }
      const currentSlide = slides[currentIndex];
      if (currentSlide) {
        currentSlide.classList.add("active");
        activeSlide = currentSlide;
      }
      // Force a reflow to ensure proper positioning
      carouselRef.current?.offsetHeight;
    }, 100);

    // Also center immediately if this is the first run
    if (firstRun) {
      loop.toIndex(currentIndex, { duration: 0 });
    }

    // Set firstRun to false after all initialization is complete
    firstRun = false;

    // image parallax, horizontalLoop() was customized to call this function onUpdate of the carousel timeline
    function slideImgUpdate() {
      slides.forEach(slide => {
        const rect = slide.getBoundingClientRect();
        const prog = gsap.utils.mapRange(-rect.width, innerWidth, 0, 1, rect.x);
        const val = gsap.utils.clamp(0, 1, prog);
        gsap.set(slide.querySelector("img"), {
          xPercent: gsap.utils.interpolate(0, -50, val),
        });
      });
    }

    // tween active/inactive slide states
    function showActive() {
      gsap
        .timeline({ defaults: { overwrite: "auto", ease: "power1.inOut" } })
        .to(".carousel-container, .carousel-item-content, .carousel-item img", { scale: 1, ease: "expo" }, 0)
        // .to(".carousel-item", { opacity: (i, t) => (t.classList.contains("active") ? 1 : 0.2) }, 0)
        .progress(firstRun ? 1 : 0); // skip active slide animation on first run
    }

    /*
    This helper function makes a group of elements animate along the x-axis in a seamless, responsive loop.
    
    Source: https://gsap.com/docs/v3/HelperFunctions/helpers/seamlessLoop
    
    Features:
     - Uses xPercent so that even if the widths change (like if the window gets resized), it should still work in most cases.
     - When each item animates to the left or right enough, it will loop back to the other side
     - Optionally pass in a config object with values like draggable: true, center: true, speed (default: 1, which travels at roughly 100 pixels per second), paused (boolean), repeat, reversed, and paddingRight.
     - The returned timeline will have the following methods added to it:
       - next() - animates to the next element using a timeline.tweenTo() which it returns. You can pass in a vars object to control duration, easing, etc.
       - previous() - animates to the previous element using a timeline.tweenTo() which it returns. You can pass in a vars object to control duration, easing, etc.
       - toIndex() - pass in a zero-based index value of the element that it should animate to, and optionally pass in a vars object to control duration, easing, etc. Always goes in the shortest direction
       - current() - returns the current index (if an animation is in-progress, it reflects the final index)
       - times - an Array of the times on the timeline where each element hits the "starting" spot.
     */
    function horizontalLoop(items, config) {
      let timeline;
      items = gsap.utils.toArray(items);
      config = config || {};
      gsap.context(() => {
        // use a context so that if this is called from within another context or a gsap.matchMedia(), we can perform proper cleanup like the "resize" event handler on the window
        let onChange = config.onChange,
          lastIndex = 0,
          tl = gsap.timeline({
            repeat: config.repeat,
            onUpdate:
              onChange &&
              function () {
                slideImgUpdate(); // custom function added to create parallax movement on the images

                let i = tl.closestIndex();
                if (lastIndex !== i) {
                  lastIndex = i;
                  onChange(items[i], i);
                }
              },
            paused: config.paused,
            defaults: { ease: "none" },
            onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100),
          }),
          length = items.length,
          startX = items[0].offsetLeft,
          times = [],
          widths = [],
          spaceBefore = [],
          xPercents = [],
          curIndex = 0,
          indexIsDirty = false,
          center = config.center,
          pixelsPerSecond = (config.speed || 1) * 100,
          snap = config.snap === false ? v => v : gsap.utils.snap(config.snap || 1), // some browsers shift by a pixel to accommodate flex layouts, so for example if width is 20% the first element's width might be 242px, and the next 243px, alternating back and forth. So we snap to 5 percentage points to make things look more natural
          timeOffset = 0,
          container = center === true ? items[0].parentNode : gsap.utils.toArray(center)[0] || items[0].parentNode,
          totalWidth,
          getTotalWidth = () =>
            items[length - 1].offsetLeft +
            (xPercents[length - 1] / 100) * widths[length - 1] -
            startX +
            spaceBefore[0] +
            items[length - 1].offsetWidth * gsap.getProperty(items[length - 1], "scaleX") +
            (parseFloat(config.paddingRight) || 0),
          populateWidths = () => {
            let b1 = container.getBoundingClientRect(),
              b2;
            items.forEach((el, i) => {
              widths[i] = parseFloat(gsap.getProperty(el, "width", "px"));
              xPercents[i] = snap((parseFloat(gsap.getProperty(el, "x", "px")) / widths[i]) * 100 + gsap.getProperty(el, "xPercent"));
              b2 = el.getBoundingClientRect();
              spaceBefore[i] = b2.left - (i ? b1.right : b1.left);
              b1 = b2;
            });
            gsap.set(items, {
              // convert "x" to "xPercent" to make things responsive, and populate the widths/xPercents Arrays to make lookups faster.
              xPercent: i => xPercents[i],
            });
            totalWidth = getTotalWidth();
          },
          timeWrap,
          populateOffsets = () => {
            timeOffset = center ? (tl.duration() * (container.offsetWidth / 2)) / totalWidth : 0;
            center &&
              times.forEach((t, i) => {
                times[i] = timeWrap(tl.labels["label" + i] + (tl.duration() * widths[i]) / 2 / totalWidth - timeOffset);
              });
          },
          getClosest = (values, value, wrap) => {
            let i = values.length,
              closest = 1e10,
              index = 0,
              d;
            while (i--) {
              d = Math.abs(values[i] - value);
              if (d > wrap / 2) {
                d = wrap - d;
              }
              if (d < closest) {
                closest = d;
                index = i;
              }
            }
            return index;
          },
          populateTimeline = () => {
            let i, item, curX, distanceToStart, distanceToLoop;
            tl.clear();
            for (i = 0; i < length; i++) {
              item = items[i];
              curX = (xPercents[i] / 100) * widths[i];
              distanceToStart = item.offsetLeft + curX - startX + spaceBefore[0];
              distanceToLoop = distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");
              tl.to(item, { xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100), duration: distanceToLoop / pixelsPerSecond }, 0)
                .fromTo(
                  item,
                  { xPercent: snap(((curX - distanceToLoop + totalWidth) / widths[i]) * 100) },
                  {
                    xPercent: xPercents[i],
                    duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
                    immediateRender: false,
                  },
                  distanceToLoop / pixelsPerSecond
                )
                .add("label" + i, distanceToStart / pixelsPerSecond);
              times[i] = distanceToStart / pixelsPerSecond;
            }
            timeWrap = gsap.utils.wrap(0, tl.duration());
          },
          refresh = deep => {
            let progress = tl.progress();
            tl.progress(0, true);
            populateWidths();
            deep && populateTimeline();
            populateOffsets();
            deep && tl.draggable && tl.paused() ? tl.time(times[curIndex], true) : tl.progress(progress, true);
          },
          onResize = () => refresh(true),
          proxy;
        gsap.set(items, { x: 0 });
        populateWidths();
        populateTimeline();
        populateOffsets();
        window.addEventListener("resize", onResize);
        function toIndex(index, vars) {
          vars = vars || {};
          Math.abs(index - curIndex) > length / 2 && (index += index > curIndex ? -length : length); // always go in the shortest direction
          let newIndex = gsap.utils.wrap(0, length, index),
            time = times[newIndex];
          if (time > tl.time() !== index > curIndex && index !== curIndex) {
            // if we're wrapping the timeline's playhead, make the proper adjustments
            time += tl.duration() * (index > curIndex ? 1 : -1);
          }
          if (time < 0 || time > tl.duration()) {
            vars.modifiers = { time: timeWrap };
          }
          curIndex = newIndex;
          vars.overwrite = true;
          gsap.killTweensOf(proxy);
          return vars.duration === 0 ? tl.time(timeWrap(time)) : tl.tweenTo(time, vars);
        }
        tl.toIndex = (index, vars) => toIndex(index, vars);
        tl.closestIndex = setCurrent => {
          let index = getClosest(times, tl.time(), tl.duration());
          if (setCurrent) {
            curIndex = index;
            indexIsDirty = false;
          }
          return index;
        };
        tl.current = () => (indexIsDirty ? tl.closestIndex(true) : curIndex);
        tl.next = vars => toIndex(tl.current() + 1, vars);
        tl.previous = vars => toIndex(tl.current() - 1, vars);
        tl.times = times;
        tl.progress(1, true).progress(0, true); // pre-render for performance
        if (config.reversed) {
          tl.vars.onReverseComplete();
          tl.reverse();
        }
        if (config.draggable && typeof Draggable === "function") {
          proxy = document.createElement("div");
          let wrap = gsap.utils.wrap(0, 1),
            ratio,
            startProgress,
            draggable,
            dragSnap,
            lastSnap,
            initChangeX,
            wasPlaying,
            align = () => tl.progress(wrap(startProgress + (draggable.startX - draggable.x) * ratio)),
            syncIndex = () => tl.closestIndex(true);
          typeof InertiaPlugin === "undefined" &&
            console.warn("InertiaPlugin required for momentum-based scrolling and snapping. https://greensock.com/club");
          draggable = Draggable.create(proxy, {
            trigger: items[0].parentNode,
            type: "x",
            onPressInit() {
              config.onPress(); // custom function added to animate slides onPress

              let x = this.x;
              gsap.killTweensOf(tl);
              wasPlaying = !tl.paused();
              tl.pause();
              startProgress = tl.progress();
              refresh();
              ratio = 1 / totalWidth;
              initChangeX = startProgress / -ratio - x;
              gsap.set(proxy, { x: startProgress / -ratio });
            },
            onDrag: align,
            onThrowUpdate: align,
            overshootTolerance: 0,
            inertia: true,
            snap(value) {
              //note: if the user presses and releases in the middle of a throw, due to the sudden correction of proxy.x in the onPressInit(), the velocity could be very large, throwing off the snap. So sense that condition and adjust for it. We also need to set overshootTolerance to 0 to prevent the inertia from causing it to shoot past and come back
              if (Math.abs(startProgress / -ratio - this.x) < 10) {
                return lastSnap + initChangeX;
              }
              let time = -(value * ratio) * tl.duration(),
                wrappedTime = timeWrap(time),
                snapTime = times[getClosest(times, wrappedTime, tl.duration())],
                dif = snapTime - wrappedTime;
              Math.abs(dif) > tl.duration() / 2 && (dif += dif < 0 ? tl.duration() : -tl.duration());
              lastSnap = (time + dif) / tl.duration() / -ratio;
              return lastSnap;
            },
            onRelease() {
              config.onRelease(); // custom function added to animate slides onRelease

              syncIndex();
              draggable.isThrowing && (indexIsDirty = true);
            },
            onThrowComplete: () => {
              syncIndex();
              wasPlaying && tl.play();
            },
          })[0];
          tl.draggable = draggable;
        }
        tl.closestIndex(true);
        lastIndex = curIndex;
        onChange && onChange(items[curIndex], curIndex);
        timeline = tl;
        return () => window.removeEventListener("resize", onResize); // cleanup
      });
      return timeline;
    }

    // Cleanup function
    return () => {
      if (observer) {
        observer.kill();
      }
    };
  }, [showcases, currentIndex, onSelect]);

  // Initialize backdrop filter values when component mounts
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.style.setProperty("--backdrop-blur", "5px");
      modalRef.current.style.setProperty("--webkit-backdrop-blur", "5px");
    }
  }, []);

  // Entry animation when QuickNav opens
  useEffect(() => {
    if (modalRef.current && contentRef.current && !isAnimating.current) {
      isAnimating.current = true;

      // Set initial states
      gsap.set(modalRef.current, {
        opacity: 0,
      });

      // Set backdrop filter via CSS custom properties for better GSAP compatibility
      modalRef.current.style.setProperty("--backdrop-blur", "0px");
      modalRef.current.style.setProperty("--webkit-backdrop-blur", "0px");

      gsap.set(contentRef.current, {
        y: "100%",
        scale: 0.8,
        opacity: 0,
      });

      gsap.set(".carousel-item", {
        y: 30,
        opacity: 0,
        scale: 0.9,
      });

      gsap.set(["h3", ".close-modal"], {
        opacity: 0,
        y: -20,
        // scale: 0.8
      });

      // Entry animation timeline with precise positioning
      const tl = gsap.timeline({
        ease: "power3.out",
        onComplete: () => {
          isAnimating.current = false;
        },
      });

      // Backdrop fade in (0s)
      tl.to(modalRef.current, {
        opacity: 1,
        duration: 0.2,
        ease: "power2.out",
      });

      // Backdrop blur in (0s - parallel with fade)
      tl.to(
        modalRef.current,
        {
          "--backdrop-blur": "8px",
          "--webkit-backdrop-blur": "8px",
          "duration": 0.3,
          "ease": "power2.out",
        },
        "<"
      );

      // Content slide up and scale (0.2s)
      tl.to(
        contentRef.current,
        {
          y: "0%",
          scale: 1,
          opacity: 1,
          duration: 0.3,
          ease: "power3.out",
        },
        "<"
      );

      // Title fade in (0.4s)
      tl.to(
        "h3",
        {
          opacity: 1,
          y: 0,
          // scale: 1,
          duration: 0.3,
          ease: "power2.out",
        },
        ">"
      );

      // Carousel items stagger in (0.5s)
      tl.to(
        ".carousel-item",
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
        },
        "<0.1"
      );

      // Close button fade in (0.6s)
      tl.to(
        ".close-modal",
        {
          opacity: 1,
          // y: 0,
          // scale: 1,
          duration: 0.3,
          ease: "power2.out",
        },
        "<"
      );
    }
  }, []);

  // Exit animation when QuickNav closes
  const handleClose = useCallback(() => {
    if (isAnimating.current) return;

    isAnimating.current = true;

    const tl = gsap.timeline({
      ease: "power3.in",
      onComplete: () => {
        onClose();
      },
    });

    // Close button and title fade out (0s)
    tl.to([".close-modal"], {
      opacity: 0,
      // y: -20,
      scale: 0.8,
      duration: 0.3,
      ease: "power2.in",
    });

    tl.to(["h3"], {
      opacity: 0,
      // y: -20,
      // scale: 0.8,
      duration: 0.3,
      ease: "power2.in",
    });

    // Carousel items stagger out (0.1s)
    tl.to(
      ".carousel-item",
      {
        y: 30,
        opacity: 0,
        scale: 0.9,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.in",
      },
      "<0.1"
    );

    // Content slide down and scale (0.3s)
    tl.to(
      contentRef.current,
      {
        y: "100%",
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
        ease: "power3.in",
      },
      ">"
    );

    // Backdrop fade out (0.4s)
    tl.to(
      modalRef.current,
      {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
      },
      ">"
    );

    // Backdrop blur out (0.4s - parallel with fade)
    tl.to(
      modalRef.current,
      {
        "--backdrop-blur": "0px",
        "--webkit-backdrop-blur": "0px",
        "duration": 0.3,
        "ease": "power2.in",
      },
      "<"
    );
  }, [onClose]);

  // Close on ESC / resize
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === "Escape") handleClose();
    };
    const handleResize = () => {
      handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [handleClose]);

  return (
    <div className='quick-nav-modal' ref={modalRef} onClick={e => e.target === modalRef.current && handleClose()}>
      <div className='quick-nav-content' ref={contentRef}>
        <button className='close-modal' onClick={handleClose} aria-label='Close'>
          ✕
        </button>

        <h3>All Showcases</h3>

        <div className='carousel-container' ref={carouselRef}>
          {showcases.map((showcase, index) => {
            const isCurrentShowcase = index === currentIndex;
            return (
              <div
                key={`${showcase.id}-${index}`}
                className={`carousel-item ${isCurrentShowcase ? "active" : ""}`}
                data-original-index={index}
              >
                <div className='carousel-item-content'>
                  <img
                    src={showcase.thumbnail || "/default-thumbnail.jpg"}
                    alt={showcase.title}
                    loading='lazy'
                    className={isCurrentShowcase ? "current-showcase" : ""}
                  />

                  {/* Current showcase indicator */}
                  {isCurrentShowcase && (
                    <div className='current-indicator'>
                      <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                        <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' />
                        <circle cx='12' cy='12' r='4' fill='currentColor' />
                      </svg>
                    </div>
                  )}

                  <div className='carousel-item-overlay'>
                    <span className='carousel-item-title'>{showcase.title}</span>
                    <span className='carousel-item-category'>{showcase.category}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickNav;
