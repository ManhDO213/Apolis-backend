const container = document.getElementById('home');
const links = document.querySelectorAll('.nav-bar ul li a');

document.onclick = function(e){
    if(e.target.id != 'home'){
        container.classList.remove('active');
    }
}

if (links.length) {
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      links.forEach((link) => {
          link.classList.remove('active');
      });
      link.classList.add('active');
    });
  });
}