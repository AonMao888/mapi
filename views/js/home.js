const menu = document.querySelector(".menu");
const menubtn = document.querySelector(".menubtn");
const menuclose = document.querySelector(".menu .close");
const grid = document.querySelector(".grid");
let protocol = window.location.protocol;
let host = window.location.host;
console.log(protocol+host)

fetch(protocol+'//'+host+'/json').then(re=>re.json()).then(all=>{
    for (let i = 0; i < all.length; i++) {
        grid.innerHTML += `<a href="doc/${all[i].link}" class="item">
        <h1>${all[i].name}</h1>
        <div class="des">
            <p><span class="material-symbols-outlined">dns</span>${all[i].type}</p>
            <span class="material-symbols-outlined more">arrow_forward_ios</span>
        </div>
    </a>`;
    }
})

menubtn.onclick=()=>{
    menu.style.left = '0'
}
menuclose.onclick=()=>{
    menu.style.left = '-369px'
}