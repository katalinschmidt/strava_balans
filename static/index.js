// Source: https://codepen.io/bradtraversy/pen/NaKxdP
window.onload = () => {
    const splitviewWrapper = document.getElementById('splitview-wrapper');
    const top = splitviewWrapper.querySelector('.top');
    const handle = splitviewWrapper.querySelector('.handle');
    let skew = 0;
    let delta = 0;

    // Set skew of slpitview wrapper:
    if(splitviewWrapper.className.indexOf('splitview') != -1) {
        skew = 1000;
    }
      
    // Get the delta between the mouse position and center point:
    splitviewWrapper.addEventListener('mousemove', function(evt){
        delta = (evt.clientX - window.innerWidth / 2) * 0.5;
        
        // Move handle by result:
        handle.style.left = evt.clientX + delta + 'px';
        
        // Adjust top layer width to match:
        top.style.width= evt.clientX + skew + delta + 'px';
    });
}