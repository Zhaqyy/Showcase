import React, { forwardRef } from "react";
import "../../Style/Home.scss";

const MainContent = forwardRef(({ showcases, onShowcaseClick, showcaseRefs }, ref) => {
  return (
    <div className='main' ref={ref} role='main'>
      <div className='mainhead'>
        <div className='headTitle'>
          {/* <h6>MY</h6> */}
          <p>DEMO</p>
          <p>SHOWCASES &</p>
          <p>EXPERIMENTS</p>
        </div>
        <div className='headInfo'>
          With endless ideas and inspirations, here's my special storage for 3D scenes, web experiences, web arts, designs, animation, prototypes, concepts and many more big words that I managed to bring to life.
        </div>
      </div>

      <div className='mainBody' role='grid' aria-label='Showcase items'>
        {showcases.map((item, index) => (
          <div
            key={item.id}
            className={`showcaseItem`}
            ref={el => (showcaseRefs.current[index] = el)}
            onClick={() => onShowcaseClick(index)}
            tabIndex={0}
            role='gridcell'
            aria-labelledby={`showcase-${item.id}-title`}
            aria-describedby={`showcase-${item.id}-desc`}
          >
            {/* Add thumbnail container */}
            <div className='thumbnail-container'>
              {item.thumbnail ? (
                <img
                  src={`${item.thumbnail}`}
                  alt={`Preview of ${item.title}`}
                  className='showcase-thumbnail'
                  onError={e => {
                    e.target.style.display = "none";
                    // Fallback to title if image fails to load
                    e.target.parentElement.textContent = item.title;
                  }}
                />
              ) : (
                <div className='thumbnail-fallback'>{item.title}</div>
              )}
            </div>
            <div className='item-content'>
              <h3 id={`showcase-${item.id}-title`}>{item.title}</h3>
              <div className='hover-details'>
                <p id={`showcase-${item.id}-desc`}>{item.description}</p>
                <div className='tags' role='list'>
                  {item.tags.map(tag => (
                    <span key={tag} role='listitem'>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default MainContent;
