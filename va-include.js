//==============================================================================
//
//  Inserts the virtual assistant chat into a web page
//
//==============================================================================

//DATA VALUES

var va_isMaximised = false;
var va_isOpen = false;
var va_isMobile = false;
var va_pushTimeout;
var va_chatStarted = false;

var titleBarTitle = "DVA Virtual Assistant";
var headingTitle = "Ask Cyd a Question";

/******* Helper functions ****************/

/**
 * This function sets the HTML markup for the mobile header for the virtual assistant.
 * @return string which contains the HTML markup for the mobile header.
 */
function getMobileHeader() {
    var mobileLargeClass = '',
        vaOpenClass = '';

    if (va_isOpen) {
        mobileLargeClass = ' class="va_mobileLarge" ';
        vaOpenClass = ' va_open';
    }

    var mobileStyle = '<div id="va_mobileBar"' + mobileLargeClass + ' aria-live="polite" title="' + titleBarTitle + '" aria-label="' + titleBarTitle + '">' +
        '<header class="va_header">' +
        '<body class="va_body">' +
        '<div role="heading" style="width: 100%" aria-live="polite" title="' + headingTitle + '" aria-label="' + headingTitle + '">' + headingTitle + '</div>' +
        '<div role="button" id="va_mobileToggle" aria-live="polite" class="va_mobileToggle' + vaOpenClass + '" title="' + getAltText("va_toggleIcon") + '" aria-label="' + getAltText("va_mobileToggle") + '"></div>' +
        '</body>' +
        '</header>' +
        '</div>';

    return mobileStyle;
}

/**
 * This function sets the HTML markup for the desktop header for the virtual assistant.
 * @return string which contains the HTML markup for the desktop header.
 */
function getDesktopHeader() {
    var rightMargin = calcRightMargin(),
        desktopHeaderSize = "style='right:" + rightMargin + "'",
        vaExpanded = "",
        resizeIconState = "",
        resizeIconClass = "";


    //Include these if chat is open
    if (va_isOpen) {
        vaExpanded = " va_expanded";
        resizeIconState = 'style="display: block;"';
        if (va_isMaximised) {
            desktopHeaderSize = 'style="height:490px; width:600px; right:' + rightMargin + ';"';
            resizeIconClass = ' va_large';
        } else {
            desktopHeaderSize = 'style="height:455px; width:350px; right:' + rightMargin + ';"';
        }
    }

    var desktopStyle = '<div id="va_chatHeader" ' + desktopHeaderSize + ' aria-live="polite" title="' + titleBarTitle + '" aria-label="' + titleBarTitle + '">' +
        '<div class="va_chatBorder"></div>' +
        '<header class="va_header va_clearfix">' +
        '<a href="#" id="va_skipToConversation" class="va_skipToLink va_skipToConversation" tabIndex="0" aria-hidden="true">Skip to Conversation</a> ' +
        '<h1 class="va_chatTitle" aria-live="polite" title="' + headingTitle + '" aria-label="' + headingTitle + '">' + headingTitle + '</h1>' +
        '<div id="va_resizeIcon" class="va_resizeIcon' + resizeIconClass + '" ' + resizeIconState + ' tabindex="0" aria-live="polite" title="' + getAltText("va_resizeIcon") + '" aria-label="' + getAltText("va_resizeIcon") + '" style="display: none"></div>' +
        '<div id="va_toggleIcon" class="va_toggleIcon' + vaExpanded + '" tabindex="0" aria-live="polite" title="' + getAltText("va_toggleIcon") + '" aria-label="' + getAltText("va_toggleIcon") + '"></div>' +
        '</header>' +
        '</div>';
    return desktopStyle;
}

/**
 * This function sets the required alt text for the toggle button and resize button in different UI states.
 * @return string which contains the alt text to be applied.
 */
function getAltText(element) {

    if (element == "va_toggleIcon" || element == "va_mobileToggle") {
        if (va_isOpen) {
            return "Hide " + titleBarTitle;
        } else {
            return "Open " + titleBarTitle;
        }
    } else if (element == "va_resizeIcon") {
        if (va_isMaximised) {
            return "View " + titleBarTitle + " in a smaller window";
        } else {
            return "View " + titleBarTitle + " in a larger window";
        }
    }
}

/**
 * This function applies text to the title and aria-label attributes of an element.
 */
function setAltText(element) {

    var resizeAlt = getAltText(element);
    jQuery("#" + element).prop("title", resizeAlt);
    jQuery("#" + element).attr("aria-label", resizeAlt);

}

/**
 * This function calculates the required right margin for the virtual assistant on the page depending on the state of the UI.
 * @return value to be applied as the right margin.
 */
function calcRightMargin() {
    var windowWidth = jQuery(window).width(),
        maxContainerWidth = 960,
        rightMargin = "0";

    if (windowWidth > 1100) {
        rightMargin = ((windowWidth - maxContainerWidth) / 2) - 50;
        rightMargin = rightMargin + "px";
    } else if (windowWidth > 630) {
        rightMargin = "2%";
    }
    return rightMargin;
}


/******* Insertion functions ****************/


/**
 * This function inserts a chatAnchor div to load the chat title bar in the parent page.
 */
function insertDiv() {
    var rightMargin = calcRightMargin(),
        chatAnchor = document.createElement('div'),
        appendStyle = va_isMobile == true ? getMobileHeader() : getDesktopHeader();

    chatAnchor.id = 'va_chatAnchor';
    chatAnchor.className = 'va_chatAnchor';
    chatAnchor.zIndex = 99999;
    chatAnchor.style.cssText = 'display:none;';

    jQuery('head').append('<link href="va-include.css" rel="stylesheet">');

    document.body.appendChild(chatAnchor);

    jQuery('#va_chatAnchor').append(appendStyle);
}


/**
 * This function inserts an iFrame inside the chatAnchor div to load the chat body into the parent page.
 */
function insertIframe() {

    var iframe = document.createElement('iframe');

    iframe.id = iframe.name = 'va_iframe';
    iframe.className = 'va_iframe';
    iframe.style.zIndex = 9999;
    iframe.style.background = '#E5E5E5';
    iframe.style.right = calcRightMargin();
    iframe.style.overflow = "hidden";

    // We are relying on a global variable in the source page called vaPath that lets us know which VA to load.

    console.log("About to append VA IFrame");

    jQuery('#va_chatAnchor').append(iframe);

    console.log("Added VA App within IFRAME");

}



/**
 * This function inserts the virtual assistant iFrame source.
 */
function insertIframeSrc() {
    va_chatStarted = true;

    //var context = determineContext();
    var source = "iframeSource.html";  

    jQuery.when(jQuery("#va_iframe")
        .attr("aria-live", "assertive")
        .attr("aria-relevant", "additions")
        .attr("src", source)).done(function () {
            return true;
        });
}


/**
 * This function disables the background site from scrolling.
 * Used in mobile only when the chat is opened.
 */
function disableBGScrolling() {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
}


/**
 * This function enables the background site for scrolling.
 */
function enableBGScrolling() {
    document.body.style.overflow = '';
    document.body.style.position = '';
}

/************* Mobile functions *************/

/**
 * This function opens the chat to full screen/closes to minimised tab for mobile devices.
 */
function toggleVAMobile() {
    var toggleWidth = va_isOpen ? '0px' : '100%',
        toggleHeight = va_isOpen ? '0px' : (jQuery(window).height() - 50);

    jQuery('#va_iframe').css({
        width: toggleWidth,
        height: toggleHeight,
        right: '0px',
        top: '50px'
    });
    jQuery('#va_mobileBar').toggleClass('va_mobileLarge');
    jQuery('#va_mobileToggle').toggleClass('va_open');

    va_isOpen = !va_isOpen;

    setAltText("va_mobileToggle");

    if (va_isOpen) {
        postMessageToIframe({"type":"vaOpen"})
        disableBGScrolling();
    } else {
        enableBGScrolling();
    }
}


/**
 * This function adds an on-click event listener to toggle mobile chat.
 */
function addOnClickMobile() {
    jQuery('#va_mobileToggle').on('click', function () {

        if (va_pushTimeout) {
            // If there's still a proactive push timer, clear it.
            clearTimeout(va_pushTimeout);
            va_pushTimeout = null;
        }
        if (!va_chatStarted) {
            insertIframeSrc();
        }
        toggleVAMobile();
    });

}

/**
 * Determine if the browser screen size is currently in moble format.
 */
function isWindowMobile() {
    if (typeof window.matchMedia !== "undefined") {
        return window.matchMedia("screen and (max-width: 599px), screen and (max-height: 490px)").matches;
    }
    // If mediaQuery is not supported, just go off the window dimensions.
    return jQuery(window).width() < 600;
}

/**
 * This function recalculates the height and width of the iFrame in mobile.
 */
function responsiveResize() {

    var isNewScreenMobile = isWindowMobile();

    var responsiveHeight = 0,
        responsiveWidth = 0,
        responsiveRight = "",
        responsiveTop = "",
        responsiveBottom = "",
        rightMargin = calcRightMargin();

    //Resize for mobile screens.
    if (isNewScreenMobile) {
        //Remove the desktop header, replace it with the mobile header.
        if (!va_isMobile) {
            jQuery("#va_chatHeader").replaceWith(getMobileHeader());
            // Desktop explicitly sets #va_iframe to "display: none" when closed. Mobile does not.
            // Fix to clear display style when switching to mobile.
            jQuery('#va_iframe').css("display","");
            addOnClickMobile();
        }

        //If the chat is open, resize it.
        if (va_isOpen) {
            disableBGScrolling();

            responsiveHeight = jQuery(window).height() - 50;
            responsiveWidth = jQuery(window).width();
            responsiveRight = "0px";
            responsiveTop = "50px";
        }
    }
    //Else resize for desktop screens.
    else {
        enableBGScrolling();
        //Remove mobile header and add desktop header.
        if (va_isMobile) {
            jQuery("#va_mobileBar").replaceWith(getDesktopHeader());

            //Add onclick listeners.
            addOnClickDesktop();
            addOnResize();

        } else { //Reposition chat header if not mobile.
            jQuery("#va_chatHeader").css({
                right: rightMargin
            })
        }

        //If the chat is open, reposition it.
        if (va_isOpen) {
            responsiveBottom = "0px";

            if (va_isMaximised) {
                responsiveHeight = 435;
                responsiveWidth = 600;
            } else {
                responsiveHeight = 400;
                responsiveWidth = 350;
            }
        }

        responsiveRight = rightMargin;
    }

    jQuery('#va_iframe').css({
        height: responsiveHeight,
        width: responsiveWidth,
        right: responsiveRight,
        top: responsiveTop,
        bottom: responsiveBottom
    });

    va_isMobile = isNewScreenMobile;
}


/********** Desktop functions **************/


/**
 * This function maximises/minimises the chat in desktop view.
 */
function toggleVADesktop() {
    var ariaHidden = va_isOpen ? 'true' : 'false';

    if (va_isMaximised) {
        var toggleHeight = va_isOpen ? '0px' : '435px',
            toggleWidth = va_isOpen ? '0px' : '600px',
            headerHeight = va_isOpen ? '55px' : '490px',
            headerWidth = va_isOpen ? '350px' : '600px';
    } else {
        var toggleHeight = va_isOpen ? '0px' : '400px',
            toggleWidth = va_isOpen ? '0px' : '350px',
            headerHeight = va_isOpen ? '55px' : '455px',
            headerWidth = '350px';
    }

    if (!va_isOpen) {
        if (va_isMaximised) {
            jQuery('#va_iframe').animate({
                height: toggleHeight,
                width: toggleWidth
            });
            if (!jQuery('#va_resizeIcon').hasClass('va_large')) {
                jQuery('#va_resizeIcon').addClass('va_large');
            }
        } else {
            jQuery('#va_iframe').animate({
                height: toggleHeight
            });
            jQuery('#va_iframe').css({
                width: toggleWidth
            });
        }
        jQuery('#va_iframe').css("display","inline-block");
       

    } else {
        jQuery('#va_iframe').animate({
            height: toggleHeight,
            width: "350px"
        });
        setTimeout(function () {
            jQuery('#va_iframe').css({
                width: toggleWidth,
                display: "none"
            });
        }, 500);

    }

    jQuery('#va_chatHeader').animate({
        height: headerHeight,
        width: headerWidth
    }, {duration: 400, queue: false});

    jQuery('.va_chatBorder').animate({
        width: headerWidth
    }, {duration: 400, queue: false});

    jQuery('#va_resizeIcon').toggle();
    jQuery('#va_toggleIcon').toggleClass('va_expanded');
    jQuery('#va_skipToConversation').toggleClass('active');
    jQuery('#va_skipToConversation').attr("aria-hidden", ariaHidden);
    
    va_isOpen = !va_isOpen;

    setAltText("va_toggleIcon");

    return true;
}


/**
 * This function adds an on-click listener to toggle the desktop chat.
 */
function addOnClickDesktop() {

    jQuery('#va_chatHeader').on('click', function (e) {
      
        if (!va_chatStarted) {
            insertIframeSrc();
        }

        toggleVADesktop();

        return false;
    });

    //Add listener to trigger click when enter is pressed and element focused.
    jQuery('#va_toggleIcon').bind('keyup', function (e) {
        if (e.keyCode === 13) { // 13 is enter key
            jQuery('#va_chatHeader').click();
        }
    });

    console.log("Added VA desktop on click event listener");
}


/**
 * This function resizes the chat when the resize button is clicked.
 */
function addOnResize() {
    jQuery('#va_resizeIcon').on('click', function (e) {
        resizeVA();
        //Prevent other handlers from firing.
        e.stopPropagation();
        return false;
    });

    //Add listener to trigger click when enter is pressed and element focused.
    jQuery('#va_resizeIcon').bind('keyup', function (e) {
        if (e.keyCode === 13) { // 13 is enter key
            jQuery('#va_resizeIcon').click();
            e.stopPropagation();
        }
    });

    console.log("Added VA resize event listener");
}

/**
 * This function resizes the VA on desktop to it's large/small size
 */
function resizeVA() {
    var resizeWidth = va_isMaximised ? '350px' : '600px',
        resizeHeight = va_isMaximised ? '400px' : '435px',
        resizeHeaderHeight = va_isMaximised ? '455px' : '490px',
        resizeHeaderWidth = va_isMaximised ? '350px' : '600px';

    jQuery('#va_chatHeader').animate({
        width: resizeHeaderWidth,
        height: resizeHeaderHeight
    }, {duration: 400, queue: false});

    jQuery('.va_chatBorder').animate({
        width: resizeHeaderWidth
    }, {duration: 400, queue: false});

    jQuery('#va_iframe').animate({
        height: resizeHeight,
        width: resizeWidth
    }, {duration: 400, queue: false});

    jQuery('#va_resizeIcon').toggleClass('va_large');

    va_isMaximised = !va_isMaximised;

    setAltText("va_resizeIcon");


}

/**
 * This function is used to add the virtual assistant to a page.
 */
function addVirtualAssistant() {
    console.log("VA: addVirtualAssistant started");

    va_isMobile = isWindowMobile();

    //Add the tab.
    insertDiv();
    insertIframe();

    // preload
    insertIframeSrc();

    //Event listeners.
    addOnResize();
    addOnClickDesktop();
    addOnClickMobile();

    //Add an event listener to fire responsiveResize() on every resize event.
    window.addEventListener("resize", responsiveResize);

    console.log("VA: addVirtualAssistant complete");
}

/**
 * This function is used to check to show or hide VA
 */
function checkAddingVA() {
   
          addVirtualAssistant();    

}

/** OTHER FUNCTIONS **/

/**
 * This function scrolls the page to the bottom
 */
function scrollPageToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
}


//On load, add the virtual assistant to the page.
window.onload = checkAddingVA();

console.log("VA File loaded");