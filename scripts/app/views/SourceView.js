define([
	'backbone', 'views/TopView', 'instances/contextMenus'
],
function(BB, TopView, contextMenus) {
	var SourceView = TopView.extend({
		/*events: {
			'mouseup': 'handleMouseUp',
			'click': 'handleMouseDown',
		},*/
		className: 'list-item source',
		list: null,
		initialize: function(opt, list) {
			this.list = list;
			this.el.setAttribute('draggable', 'true');
			this.setEvents();
			this.el.dataset.id = this.model.get('id');
			this.el.view = this;
		},
		handleClearEvents: function(id) {
			if (window == null || id == tabID) {
				this.clearEvents();
			}
		},
		setEvents: function() {
			this.model.on('change', this.render, this);
			this.model.on('destroy', this.handleModelDestroy, this);
			this.model.on('change:title', this.handleChangeTitle, this);
			bg.sources.on('clear-events', this.handleClearEvents, this);
			bg.favicons.on('change', this.render, this);
		},
		clearEvents: function() {
			this.model.off('change', this.render, this);
			this.model.off('destroy', this.handleModelDestroy, this);
			this.model.off('change:title', this.handleChangeTitle, this);
			bg.sources.off('clear-events', this.handleClearEvents, this);
			bg.favicons.off('change', this.render, this);
		},
		showContextMenu: function(e) {
			if (!this.$el.hasClass('selected')) {
				app.feeds.feedList.select(this, e);
			}
			contextMenus.get('source').currentSource = this.model;
			contextMenus.get('source').show(e.clientX, e.clientY);
		},
		handleChangeTitle: function() {
			this.list.placeSource(this);
		},
		handleModelDestroy: function() {
			this.list.destroySource(this);
		},
		renderInterval: 'first-time',
		render: function() {
			if (this.renderInterval == 'first-time') return this.realRender();
			if (this.renderInterval) return this;

			var that = this;
			this.renderInterval = requestAnimationFrame(function() {
				that.realRender();
			});
			return this;
		},
		realRender: function() {
			this.$el.toggleClass('has-unread', !!this.model.get('count'));

			if (this.model.get('folderID')) {
				this.el.dataset.inFolder = this.model.get('folderID');
			} else {
				this.$el.removeClass('invisible');
				delete this.el.dataset.inFolder;
			}

			this.setTitle(this.model.get('count'), this.model.get('countAll'));

			var sID = this.model.get('id'),
				favicon = '', favicons = bg.favicons.where({ sourceID: sID });

			if (favicons.length) favicon = favicons[0].get('data');

			this.$el.html(this.template(_.extend(this.model.toJSON(), {favicon: favicon})));
			this.renderInterval = null;

			if (bg.sourceToFocus === sID) {
				setTimeout(function() {
					app.trigger('focus-feed', bg.sourceToFocus);
					bg.sourceToFocus = null;
				}, 0);
			}

			return this;
		}
	});

	return SourceView;
});
