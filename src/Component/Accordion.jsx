import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import '../Style/Component.scss';

// ============================================
// // Please let me know before editing component or its style
// ============================================

/**
 * Dynamic Accordion Component - SCSS Version
 * 
 * Features:
 * - Smooth GSAP animations for expand/collapse
 * - Multiple variants: default, sidebar, minimal
 * - Support for multiple open items or single item only
 * - Custom icons and styling
 * - Accessibility features (ARIA attributes)
 * - Responsive design with mobile optimizations
 * - TypeScript-friendly props interface
 * 
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of accordion items
 * @param {string} props.items[].heading - Title for each accordion item
 * @param {string|ReactNode} props.items[].description - Content for each accordion item (supports HTML/JSX)
 * @param {number} [props.defaultActiveIndex=0] - Initially expanded item index
 * @param {boolean} [props.allowMultiple=false] - Whether multiple items can be open simultaneously
 * @param {string} [props.accordionClass] - Additional class for the accordion container
 * @param {string} [props.itemClass] - Additional class for each accordion item
 * @param {string} [props.headingClass] - Additional class for accordion headings
 * @param {string} [props.contentClass] - Additional class for accordion content
 * @param {ReactNode} [props.customIcon] - Custom icon component
 * @param {Function} [props.onItemToggle] - Callback when an item is toggled
 * @param {boolean} [props.showBorders=true] - Whether to show borders between items
 * @param {string} [props.variant='default'] - Accordion variant ('default', 'sidebar', 'minimal')
 */
const Accordion = ({
  items = [],
  defaultActiveIndex = 0,
  allowMultiple = false,
  accordionClass = '',
  itemClass = '',
  headingClass = '',
  contentClass = '',
  customIcon = null,
  onItemToggle = () => { },
  showBorders = true,
  variant = 'default'
}) => {
  // Track active indices (supports multiple open items)
  const [activeIndices, setActiveIndices] = useState(
    defaultActiveIndex !== null ? [defaultActiveIndex] : []
  );

  // Refs for animation
  const descriptionRefs = useRef([]);
  const verticalPathRefs = useRef([]);

  // Initialize refs array
  useEffect(() => {
    descriptionRefs.current = descriptionRefs.current.slice(0, items.length);
    verticalPathRefs.current = verticalPathRefs.current.slice(0, items.length);
  }, [items]);

  // Toggle item expand/collapse
  const toggleItem = (index) => {
    setActiveIndices((prev) => {
      const newIndices = allowMultiple ? [...prev] : [];
      const isActive = prev.includes(index);

      if (isActive) {
        // Collapse item
        if (descriptionRefs.current[index]) {
          gsap.to(descriptionRefs.current[index], {
            height: 0,
            opacity: 0,
            duration: 0.1,
            ease: 'power1.inOut',
          });
        }

        if (verticalPathRefs.current[index]) {
          gsap.to(verticalPathRefs.current[index], {
            opacity: 1,
            duration: 0.1,
            ease: 'power1.inOut',
          });
        }

        return newIndices.filter((i) => i !== index);
      } else {
        // Expand item
        if (descriptionRefs.current[index]) {
          gsap.fromTo(
            descriptionRefs.current[index],
            { height: 0, opacity: 0 },
            { height: 'auto', opacity: 1, duration: 0.3, ease: 'power1.inOut' }
          );
        }

        if (verticalPathRefs.current[index]) {
          gsap.to(verticalPathRefs.current[index], {
            opacity: 0,
            duration: 0.1,
            ease: 'power1.inOut',
          });
        }

        if (!allowMultiple && prev[0] !== undefined) {
          // Collapse previously open item if not allowing multiple
          if (descriptionRefs.current[prev[0]]) {
            gsap.to(descriptionRefs.current[prev[0]], {
              height: 0,
              opacity: 0,
              duration: 0.1,
              ease: 'power1.inOut',
            });
          }

          if (verticalPathRefs.current[prev[0]]) {
            gsap.to(verticalPathRefs.current[prev[0]], {
              opacity: 1,
              duration: 0.1,
              ease: 'power1.inOut',
            });
          }
        }

        return allowMultiple ? [...newIndices, index] : [index];
      }
    });

    onItemToggle(index);
  };

  // Initialize default open item
  useEffect(() => {
    if (defaultActiveIndex !== null && 
        descriptionRefs.current[defaultActiveIndex] && 
        verticalPathRefs.current[defaultActiveIndex]) {
      gsap.set(descriptionRefs.current[defaultActiveIndex], {
        height: 'auto',
        opacity: 1
      });
      gsap.set(verticalPathRefs.current[defaultActiveIndex], { opacity: 0 });
    }
  }, [defaultActiveIndex, items.length]);

  // Default icon component
  const DefaultIcon = ({ index }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      className="accordion-icon"
    >
      <path
        d="M3.34961 8.77393H12.6829"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.01628 3.60724V13.6072"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        ref={(el) => (verticalPathRefs.current[index] = el)}
        style={{ opacity: activeIndices.includes(index) ? 0 : 1 }}
      />
    </svg>
  );

  return (
    <div className={`accordion accordion--${variant} ${accordionClass}`}>
      <div className="accordion__container">
        {items.map((item, index) => (
          <div
            key={index}
            className={`accordion__item ${itemClass} ${showBorders ? 'accordion__item--bordered' : ''}`}
            data-active={activeIndices.includes(index)}
          >
            {/* Content Area */}
            <div className="accordion__content">
              <div className='accordion__headWrap' onClick={() => toggleItem(index)}>
              <h3
                className={`accordion__heading ${headingClass}`}
              >
                {item.heading}
              </h3>
               {/* Expand/Collapse Button */}
            <button
              onClick={() => toggleItem(index)}
              className="accordion__toggle"
              aria-expanded={activeIndices.includes(index)}
              aria-controls={`accordion-content-${index}`}
            >
              {customIcon ? (
                React.cloneElement(customIcon, {
                  isActive: activeIndices.includes(index),
                  index
                })
              ) : (
                <DefaultIcon index={index} />
              )}
            </button>
              </div>
              <div
                id={`accordion-content-${index}`}
                ref={(el) => (descriptionRefs.current[index] = el)}
                className={`accordion__description ${contentClass}`}
              >
                {typeof item.description === 'string' ? (
                  <p className="accordion__text">{item.description}</p>
                ) : (
                  item.description
                )}
              </div>
            </div>

           
          </div>
        ))}
      </div>
    </div>
  );
};

export default Accordion;


/*
============================================
HOW TO USE THIS COMPONENT
============================================

// Basic usage
<Accordion
  items={[
    {
      heading: 'Feature One',
      description: 'Details about feature one...',
    },
    {
      heading: 'Feature Two',
      description: 'Details about feature two...',
    }
  ]}
/>

// With multiple items open
<Accordion
  items={dropDownContent}
  allowMultiple={true}
/>

// Sidebar variant (for showcase sidebar) - CURRENTLY USED
<Accordion
  items={[
    {
      heading: 'Side Commentary',
      description: showcase.commentary
    },
    {
      heading: 'How to Use',
      description: (
        <div className="showcase-details">
          <div className="detail">
            <span className="detail-label">Soundtrack</span>
            <span>{showcase.soundtrack}</span>
          </div>
        </div>
      )
    }
  ]}
  variant="sidebar"
  showBorders={false}
  defaultActiveIndex={0}
  allowMultiple={false}
  accordionClass="showcase-accordion"
/>

// Minimal variant
<Accordion
  items={content}
  variant="minimal"
  allowMultiple={true}
/>

// With custom styling
<Accordion
  items={dropDownContent}
  accordionClass="custom-accordion"
  itemClass="custom-item"
  headingClass="custom-heading"
  contentClass="custom-content"
/>

// With custom icon component
const CustomIcon = ({ isActive }) => (
  <div className={`custom-icon ${isActive ? 'active' : ''}`}>
    {isActive ? '-' : '+'}
  </div>
);

<Accordion
  items={dropDownContent}
  customIcon={<CustomIcon />}
/>

// With all props
<Accordion
  items={dropDownContent}
  defaultActiveIndex={1}
  allowMultiple={false}
  showBorders={true}
  variant="default"
  onItemToggle={(index) => console.log('Toggled item:', index)}
/>
*/