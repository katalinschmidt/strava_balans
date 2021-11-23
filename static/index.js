window.onload = () => { 
    // Create event listener for handle:
    $('.splitview').on('mousemove', (evt) => {
        // Move the handle:
        $('.handle').css('left', `${evt.clientX}px`);

        // Match top panel to handle position:
        const skew = 1000; // 1000 so that top layer continues to show on mousemove
        $('.top').css('width', `${evt.clientX + skew}px`);
    });
}