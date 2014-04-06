var tutojs = window["tutojs"] = (function(){
    
    var ajax,
        slides = [],
        loading = {
            slides: 0,
            audios: 0,
            slide: 0,
            audio: 0
        },
        tutoDiv, tutoDivContent, audioDiv,
        soundFolder,
        slideFolder,
        curSlide
    ;
    
    function init(params){
        ajax.init();
        tutoDiv = document.getElementById("tutojs");
        tutoDiv.style.position = "relative";
        tutoDivContent = document.createElement("DIV");
        tutoDiv.appendChild(tutoDivContent);
        initPlayer();
        slideFolder = params.slideFolder ? params.slideFolder : "";
        soundFolder = params.soundFolder ? params.soundFolder : "";
        for(i in params.slides){
            slides.push(new Slide(params.slides[i]));
        }
        loadAll();
        console.log(slides);
    }
    
    function initPlayer(){
        var playerDiv, btPrev, btNext;
        playerDiv = document.createElement("DIV");
        playerDiv.id = "tutojs-player";
        playerDiv.style.position = "absolute";
        playerDiv.style.bottom = "0";
        
        btPrev = document.createElement("BUTTON");
        btPrev.id = "tutojs-bt-prev";
        btPrev.className = "tutojs-bt";
        btPrev.title = "Prev";
        btPrev.innerHTML = "Prev";
        btPrev.onclick = prev;
        playerDiv.appendChild(btPrev);
        
        audioDiv = document.createElement("SPAN");
        audioDiv.id = "tutojs-audio";
        playerDiv.appendChild(audioDiv);
        
        btNext = document.createElement("BUTTON");
        btNext.id = "tutojs-bt-next";
        btNext.className = "tutojs-bt";
        btNext.title = "Next";
        btNext.innerHTML = "Next";
        btNext.onclick = next;
        playerDiv.appendChild(btNext);
        
        tutoDiv.appendChild(playerDiv);
    }
    
    function loadAll(){
        // initiate the loading div
        var loadDiv = document.createElement("DIV");
        loadDiv.id = "tutojs_loading";
        loadDiv.innerHTML = "Loading...";
        tutoDivContent.appendChild(loadDiv);
        // load slides
        loadingSlide();
    }
    
    function loadOver(){
        tutoDivContent.removeChild(document.getElementById("tutojs_loading"));
        slides[0].display();
        curSlide = 0;
    }
    
    function loadingSlide(){
        slides[loading.slide].load(function(){
            loading.slide++;
            if(loading.slide>=loading.slides){
                return loadOver();
            }
            else{
                loadingSlide();
            }
        });
    }
    
    function Slide(params){
        var that = this;
        this.url = params.url;
        this.audios = params.audios;
        this.curAudio = 0;
        this.script = params.script ? params.script : function(){};
        this.tpl = null;
        loading.slides++;
    }
    Slide.prototype.load = function(cb){
        var that = this;
        ajax.get(slideFolder+this.url,function(data){
            that.tpl = formatHtml(data);
            cb();
        });
    };
    Slide.prototype.display = function(){
        tutoDivContent.innerHTML = this.tpl;
        var html = "<audio controls autoplay=true>", mime;
        for(i in this.audios){
            mime = getMime(this.audios[i]);
            html += "<source src='"+soundFolder+this.audios[i]+"' type='"+mime+"'>";
        }
        html += "</audio>";
        audioDiv.innerHTML = html;
        this.script();
    };
    
    ajax = {
        xhr: null,
        init:function(){
            this.xhr = new XMLHttpRequest();
        },
        get:function(url,cb){
            var that = this;
            this.xhr.onreadystatechange = function() {
                if (4===that.xhr.readyState && (200===that.xhr.status || 0===that.xhr.status)) {
                    cb(undefined===that.xhr.responseXml ? that.xhr.responseText : that.xhr.responseXml);
                }
            };
            this.xhr.open("GET", url, true);
            this.xhr.send(null);
        }
    };
    
    function formatHtml(html){
        html = html.replace(/<pre\b([^>]*)>([\s\S]+?)<\/pre>/g, function(all, attrs, content) {
            return '<pre'+attrs+'>'+content.replace(/</g,'&lt;')+'</pre>';
        });
        return html;
    }
    
    function getMime(file){
        var ext = file.substr(file.length-3,3);
        switch(ext){
            case "ogg":
                return "audio/ogg";
            case "mp3":
                return "audio/mpeg";
            case "wav":
                return "audio/wav";
        }
    }
    
    function prev(){
        if(curSlide>0){
            curSlide--;
            slides[curSlide].display();
        }
    }
    
    function next(){
        if(curSlide<slides.length){
            curSlide++;
            slides[curSlide].display();
        }
    }
    
    return {
        init:init
    };
})();