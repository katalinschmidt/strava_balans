window.onload = () => {
    const splitviewWrapper = document.getElementById('splitview-wrapper');
    const top = splitviewWrapper.querySelector('.top');
    const handle = splitviewWrapper.querySelector('.handle');
    let skew = 0;
    let delta = 0;

    if(splitviewWrapper.className.indexOf('splitview') != -1){
        skew = 1000;
      }
      
      splitviewWrapper.addEventListener('mousemove', function(evt){
        delta = (evt.clientX - window.innerWidth / 2) * 0.5;
      
        handle.style.left = evt.clientX + delta + 'px';
    
        top.style.width= evt.clientX + skew + delta + 'px';
      });
}