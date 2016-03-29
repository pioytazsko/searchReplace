(function($) {
    SearchWord = function() {
        this.showInputBox();
        this.searchBoxInit();
    };
    SearchWord.prototype = {
        settingSelectors: {
            pageContent: '#pagesContainer',
            searchButton: '.guide_search',
            searchInputWord: '#sSearch',
            nextResultButton: '.gl_search_item.guide_search_forward',
            prevResultButton: '',
            showResultPanel: '#guideSearchResultsTableCell',
            showResultPanelButton: '.gl_search_item.guide_search_extended',
            showSearchBox: '.toolbar__button_search',
            showReplaceBox: '.toolbar__button_replace',
            searchBox: '.gl_search ',
            replaceBox: '.gl_search_item ',
        },
        options: {},
        resultSearch: [],
        activeResult: {
            index: 0
        },
        rollbackObj: {
            elements: [],
            oldWord: []
        },
        
        searchBoxInit: function() {
            this.unWrapSearhResult();
            var thisObject = this;

            $(this.settingSelectors.searchButton).click(function(event) {
                thisObject.unWrapSearhResult();
                thisObject.searchWord($(thisObject.settingSelectors.searchInputWord).val());
                thisObject.resultSearch = [].slice.call(document.getElementsByTagName(thisObject.options.search_element));
                if (thisObject.resultSearch.length !== 0) {
                    thisObject.activeResult = {
                        index: 0
                    };
                    thisObject.resultSearch[thisObject.activeResult.index].style.background = "#FF0000";
                }
                thisObject.createSlideSearchContent();
                $('.search_result').click(function(event) {
                    event.stopImmediatePropagation();
                    var index = $(this).attr('result_index');
                    thisObject.scrollToResult(thisObject.resultSearch[index]);
                    thisObject.activeResult.index = index;
                });
                thisObject.scrollToResult(thisObject.resultSearch[thisObject.activeResult.index]);
            });
            $(this.settingSelectors.nextResultButton).click(function() {
                thisObject.nextResult();
            });
            $(this.settingSelectors.showResultPanelButton).click(function() {
                if (thisObject.resultSearch.length !== 0) {
                    $(thisObject.settingSelectors.showResultPanel).slideToggle();
                }
            });
            $('.gl_search_item.guide_replace').click(function() {
                thisObject.replace();
            });
            $('.gl_search_item.guide_replace_all').click(function() {
                thisObject.replaceWithRollBack();
                $('.search_notification').show(300, function() {
                    $('.search_matches_cnt').text();
                });
            });
            $('form.search_notification').children('input.submit').click(function() {
                this.unwrapRollbackTag();
                $('.search_notification').hide();
            }.bind(this));

            $('form.search_notification').children('input.rollback').click(function() {
                this.rollBackAfterReplace();
                $('.search_notification').hide();
                $('.changes_canceled').show(300, function() {
                    $('form.changes_canceled').children('.submit').click(function(event) {
                        event.stopImmediatePropagation();
                        $('.changes_canceled').hide();
                    });
                    $('form.changes_canceled').children('.rollback').click(function(event) {
                        event.stopImmediatePropagation();
                        thisObject.replaceWithRollBack();
                        $('.changes_canceled').hide();
                    });
                });
            }.bind(this));
        },

        searchWord: function(text) {
            if (text !== '') {
                text = text.trim();
                this.options = applicationWidgets.WidgetSettings;
                $(this.settingSelectors.pageContent).not(this.settingSelectors.showResultPanel).highLight(text, this.options);
            }
        },

        showInputBox: function() {
            var thisObject = this;
            $(this.settingSelectors.showSearchBox).click(function(event) {
                event.preventDefault();
                $(thisObject.settingSelectors.searchBox).slideToggle();
            });
            $(this.settingSelectors.showReplaceBox).click(function(event) {
                event.preventDefault();
                $(thisObject.settingSelectors.searchBox).slideToggle();
                $(this.settingSelectors.searchBox).toggleClass('replace');
                return false;

            }.bind(this));
        },

        createSlideSearchContent: function() {
            if (this.isActive()) {
                var html = '';

                this.clearSliderSearchContent();



                var parentNode, leftRange, rightRange, resultNode, resultRange;
                for (var i = 0; i < this.resultSearch.length; i++) {

                    parentNode = this.resultSearch[i].parentElement;

                    resultNode = this.resultSearch[i];
                    resultRange = document.createRange();
                    resultRange.selectNode(resultNode);

                    leftRange = document.createRange();
                    leftRange.selectNode(parentNode);
                    leftRange.setEnd(resultRange.startContainer, resultRange.startOffset);

                    rightRange = document.createRange();
                    rightRange.selectNode(parentNode);
                    rightRange.setStart(resultRange.endContainer, resultRange.endOffset);

                    html = html + '<p class="search_result" result_index="' + i + '">' + leftRange.toString() + this.resultSearch[i].outerHTML + rightRange.toString() + '</p>';
                }
                $('#guideSearchResults').append(html);
                $('#guideSearchResults').children('p').children(this.options.search_element).css({
                    'background': ''
                });
            }
        },

        nextResult: function() {
            if (this.isActive()) {
                this.setNextIndexActive();
                this.scrollToResult(this.resultSearch[this.activeResult.index]);
                this.lightActiveResult();
            }
        },

        prevResult: function() {
            if (this.isActive()) {

                if (this.activeResult.index > 0) {
                    this.activeResult.index--;
                } else {
                    this.activeResult.index = this.resultSearch.length - 1;
                }
            }
            this.lightActiveResult();
        },

        scrollToResult: function(elem) {
            if (this.isActive()) {
                elem.scrollIntoView(true);
                for (var i = 0; i < this.resultSearch.length; i++) {
                    this.resultSearch[i].style.background = '';
                }
                elem.style.background = '#FF0000';
                document.getElementById('guideContent').scrollTop -= 70;
            }

        },

        lightActiveResult: function() {
            if (this.isActive()) {
                for (var i = 0; i < this.resultSearch.length; i++) {
                    if (i !== this.activeResult.index) {
                        this.resultSearch[i].style.background = '';
                    } else {
                        this.resultSearch[i].style.background = '#ff0000';
                    }
                }
            }
        },

        isActive: function() {
            if (this.resultSearch.length > 0) {
                return true;
            } else {
                return false;
            }
        },

        setNextIndexActive: function() {
            if (this.isActive()) {
                if (this.activeResult.index < this.resultSearch.length - 1) {
                    this.activeResult.index++;
                } else {
                    this.activeResult.index = 0;
                }
            }
        },

        getActiveParagraph: function(elem) {
            return $(elem).closest('.content-page-paragraph');
        },

        clearSliderSearchContent: function() {
            $('#guideSearchResults').children('.search_result').remove();
        },

        replace: function() {
            if (this.isActive()) {
                var newWord = $('#sReplace').val();
                this.resultSearch[this.activeResult.index].innerText = newWord;
                var paragraphs = this.getActiveParagraph(this.resultSearch[this.activeResult.index]);
                this.unwrapElement(this.resultSearch[this.activeResult.index]);
                this.scrollToResult(this.resultSearch[this.activeResult.index]);
                applicationWidgets.ContentDocument.normalizeParagraphWidth(paragraphs);
                return true;
            }
        },

        replaceWithRollBack: function() {
            if (this.isActive()) {
                this.rollbackObj.oldWord = this.resultSearch[0].innerText;

                var arrParagraph = [];
                var newWord = $('#sReplace').val();
                for (var i = 0; i < this.resultSearch.length; i++) {
                    this.rewrapAndReplace(this.resultSearch[i], 'span_rlb', newWord);
                }
                this.rollbackObj.elements = $('span_rlb').toArray();
                this.clearSliderSearchContent();
                var lengthResultSearch = this.resultSearch.length;
                this.resultSearch = [];





            }
        },

        rollBackAfterReplace: function() {
            if (this.rollbackObj.elements.length > 0) {
                for (var i = 0; i < this.rollbackObj.elements.length; i++) {
                    this.rollbackObj.elements[i].innerText = this.rollbackObj.oldWord;
                    var innerHtml = this.rollbackObj.elements[i].innerHTML;
                    $(this.rollbackObj.elements[i]).before(innerHtml);
                    var parent = this.rollbackObj.elements[i].parentNode;
                    $(this.rollbackObj.elements[i]).remove();
                    parent.normalize();
                }
                this.rollbackObj.elements = [];
                this.rollbackObj.oldWord = '';
                $(this.settingSelectors.searchButton).trigger('click');

            }
        },

        rewrapAndReplace: function(elem, newTag, newText) {
            if (this.isActive()) {
                elem.innerText = newText;
                var innerHtml = '<' + newTag + '>' + elem.innerHTML + '</' + newTag + '>';
                $(elem).before(innerHtml);
                var parent = elem.parentNode;
                $(elem).remove();
                parent.normalize();

            }
        },

        unwrapRollbackTag: function() {
            if (this.rollbackObj.elements.length > 0) {
                for (var i = 0; i < this.rollbackObj.elements.length; i++) {
                    var innerHtml = this.rollbackObj.elements[i].innerHTML;
                    $(this.rollbackObj.elements[i]).before(innerHtml);
                    var parent = this.rollbackObj.elements[i].parentNode;
                    $(this.rollbackObj.elements[i]).remove();
                    parent.normalize();
                }
                this.rollbackObj.elements = [];
                this.rollbackObj.oldWord = '';

            }
        },

        unWrapSearhResult: function() {
            if (this.isActive()) {
                var arr = document.getElementsByTagName(this.options.search_element);
                var parent;
                for (var i = 0; i < arr.length; i++) {
                    var innerHtml = arr[i].innerHTML;
                    $(arr[i]).before(innerHtml);
                    parent = arr[i].parentNode;
                    $(arr[i]).remove();
                    parent.normalize();
                }
                $(this.options.search_element).remove();
                this.clearSliderSearchContent();
            }
        },

        unwrapElement: function(elem, callback) {
            var elemHtml = elem.innerHTML;
            $(elem).before(elemHtml);
            var parent = elem.parentNode;


            for (var i = 0; i < this.resultSearch.length; i++) {
                if (this.resultSearch[i] == elem) {
                    this.resultSearch.splice(i, 1);
                }
            }
            $(elem).remove();
            parent.normalize();
            this.lightActiveResult();
            this.createSlideSearchContent();

        },



    };
    document.addEventListener("initNavigator", function(event) {
        applicationWidgets.searchWord = new SearchWord();
        $(document).on('HOOK_PAGE_CONTENT_BEFORE_CHANGE', function(event) {
            if ($.searchWord.isActive()) {
                // TODO
                var cursorPosition = $('.sys_page-paragraph.current').data('manipulation').getCurrentCursorPosition();
                $.searchWord.unWrapSearhResult();
                $('.sys_page-paragraph.current').data('manipulation').setCursorPosition(cursorPosition);
            }
        });

    });



})(WidjQuery);
