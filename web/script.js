// Receive json with webm paths and its created date (it contains only y and m).
// It looks like => some_date: [path1, path2, ..., pathN)

function createPage (dates_names) {
    Object.keys(dates_names).forEach(function(date) {

      let div = document.createElement('div');
      div.className = `date-container`;
      div.innerHTML = `<strong class="date">${date}</strong>`;
      document.body.append(div);
        dates_names[date].forEach(function (name) {
            const path = `webm/${name}`
            let raw_name = name.replace(/\.[^/.]+$/, "")
            const poster = `thumbnails/${raw_name}.png`
            html = `<a href="#" class="post__image" id=${path} data-name=${name} onclick="return false;"><img class="video" src="${poster}" alt=""></a>`;
            div.innerHTML += html
            //div.insertAdjacentHTML('beforeend', html);
        })
    });
    doVideoLogic();
}

function doVideoLogic() {
    const dateContainer = document.querySelector('.date-container');
    const date = document.querySelector('.date');
    const modal = document.querySelector('.modal');
    const videos = document.querySelectorAll('.video');
    const video = document.querySelector('.modal video');
    let videoOpen = false;
    function dragAndZoom(elmnt) {
        let scale = 1;
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        let start, end, delta
        elmnt.onmousedown = dragMouseDown;
        elmnt.onwheel = zoom;

        function zoom(e) {
            e = e || window.event;
            e.preventDefault();
            let delta = e.deltaY
            if (delta > 0) {
                if(scale < 0.50) {return}
                scale -= 0.25
            } else {
                scale += 0.25
            }
            elmnt.style.transform = `scale(${scale})`;
        }

        function dragMouseDown(e) {
            start = new Date();
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement(e) {
            end = new Date();
            delta = (end - start) / 1000.0;
            console.log(delta);
            if (delta < 0.150) {
                videoOpen = false;
                video.pause();
                modal.style.transform = `scale(1)`;
                modal.classList.remove('show');
            } else {
                // stop moving when mouse button is released:
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }
    }
    function openVideo (e) {
        videoOpen = true;

        const path = e.path[1]['id'];
        const name = e.path[1].attributes['data-name'].value
        console.log(name)
        console.log(e)
        video.src =`${path}`;
        let raw_name = path.replace(/\.[^]+$/, "")
        document.documentElement.style.setProperty('--text', `'${name}`);
        modal.classList.add('show');
        const video1 = document.querySelector('.modal video').videoHeight;
        console.log(video1)
    }
    // Close the modal if body was clicked
    function closeModal (e) {
        if(!videoOpen) { return }
        console.log(e)
        const element = e.path[0].attributes['class'].value;
        console.log(element)
        if(element === 'date' || element === 'date-container') {
            videoOpen = false;
            video.pause();
            modal.style.transform = `scale(1)`;
            modal.classList.remove('show');

        }
    }
    // Add listeners
    document.addEventListener('click', closeModal);
    videos.forEach((video) => {
        video.addEventListener('click', openVideo);
    });
    video.addEventListener('loadedmetadata', function(e){

        let videoWidth = video.videoWidth;
        let videoHeight = video.videoHeight;

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const left = (windowWidth - videoWidth) / 2;
        const top = (windowHeight - videoHeight) / 2;
        modal.style.top = top + "px";
        modal.style.left = left + "px";
    });
    dragAndZoom(modal);
}

eel.get_sorted_webm()(createPage);


