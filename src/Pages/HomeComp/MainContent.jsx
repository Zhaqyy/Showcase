import React, { forwardRef } from "react";
import "../../Style/Home.scss";

const MainContent = forwardRef(({ showcases, onShowcaseClick, showcaseRefs }, ref) => {
  return (
    <div className='main' ref={ref} role='main'>
      <div className='mainhead'>
        <div className='headTitle'>
          <h6>LOOK THROUGH MY</h6>
          <p>MIND</p>
          <p>EXPERIMENTS</p>
          <p>INNER CHAMBER</p>
        </div>
        <div className='headInfo'>
          They say the mind is as vast as the universe but mine is an unmanaged zoo with ideas and inspirations. A special storage for 3D
          scenes, web experiences, web arts, designs, prototypes, concepts and many more big words that I managed to bring to life.
        </div>
      </div>

      <div className='mainBody' role='grid' aria-label='Showcase items'>
        {showcases.map((item, index) => (
          <div
            key={item.id}
            className={`showcaseItem`}
            ref={el => (showcaseRefs.current[index] = el)}
            onClick={() => onShowcaseClick(index)}
            onKeyDown={e => handleKeyDown(e, index)}
            tabIndex={0}
            role='gridcell'
            aria-labelledby={`showcase-${item.id}-title`}
            aria-describedby={`showcase-${item.id}-desc`}
          >
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
