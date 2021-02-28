// ——————————————————————————————————————————————————
// TextScramble
// ——————————————————————————————————————————————————

class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }
    setText(newText, prevText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise(resolve => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="dud">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}


// ——————————————————————————————————————————————————
// Example
// ——————————————————————————————————————————————————




const el = document.querySelector('.text');
const fx = new TextScramble(el);

const showCode = (code) => {
    fx.setText(code).then(() => {
        //   setTimeout(next, 800);
    });
};

const exEL = document.querySelector('#expiration');
const exFX = new TextScramble(exEL);

let expirationIntrv
const showExpiration = (expiration) => {
    let expire = new Date(expiration).getTime()-(10*1000);
    let curr = Date.now();
    expirationIntrv = setInterval(() => {
        console.log("fff")
        curr += 1000
        let diff = expire - curr
        if (diff < 0){
            clearInterval(expirationIntrv)
            showCode("EXPIRED :(")
            document.getElementById("pair-description").innerHTML="The Pairing Code has been expired. You can get a new code by restarting the device. If there was any issue with pairing your device you can call Mohammad."
            return;
        }
        let num = Math.floor(diff / (1000))
        let seconds = num % 60;
        let str = `${seconds} second${(seconds == 1) ? "" : "s"}`;

        num = Math.floor(num / 60)
        let minutes = num % 60;
        if (minutes > 0) str = `${minutes} minute${(minutes == 1) ? "" : "s"} and ${str}`
        num = Math.floor(num / 60)
        let hours = num % 24
        if (hours > 0) str = `${hours} hour${(hours == 1) ? "" : "s"} and ${str}`
        num = Math.floor(num / 24)
        let days = Math.floor(num);
        if (days > 0) str = `${days} day${(days == 1) ? "" : "s"}, ${str}`
            
        exEL.innerHTML=str;
        document.getElementById("pair-description").style.opacity=1;
    }, 1000)

};