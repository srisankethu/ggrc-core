/*!
    Copyright (C) 2015 Google Inc., authors, and contributors <see AUTHORS file>
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
    Created By: ivan@reciprocitylabs.com
    Maintained By: ivan@reciprocitylabs.com
*/

(function(can, $) {
  can.Component.extend({
    tag: "relevant-filter",
    template: can.view(GGRC.mustache_path + "/mapper/relevant_filter.mustache"),
    scope: {
      relevant_menu_item: "@",
      show_all: "@",
      menu: can.compute(function () {
        var type = this.attr("type"),
            showAll = /true/i.test(this.attr("show_all")),
            isAll = type === "AllObject",
            mappings;

        if (showAll) {
          return _.sortBy(_.compact(_.map(GGRC.tree_view.base_widgets_by_type[type], function (mapping) {
            return CMS.Models[mapping];
          })), "model_singular");
        }
        if (this.attr("search_only") && isAll) {
          mappings = GGRC.tree_view.base_widgets_by_type;
        } else {
          type = isAll ? GGRC.page_model.type : this.attr("type");
          mappings = GGRC.Mappings.get_canonical_mappings_for(type);
        }

        return _.sortBy(_.compact(_.map(_.keys(mappings), function (mapping) {
          return CMS.Models[mapping];
        })), "model_singular");
      })
    },
    events: {
      ".add-filter-rule click": function (el, ev) {
        ev.preventDefault();
        var menu = this.scope.attr("menu");

        if (this.scope.attr("relevant_menu_item") === "parent"
            && +this.scope.attr("panel_number") !== 0
            && !this.scope.attr("has_parent")) {
          menu.unshift({
            title_singular: "Previous objects",
            model_singular: "__previous__"
          });
        }

        this.scope.attr("relevant").push({
          value: false,
          filter: new can.Map(),
          menu: menu,
          model_name: menu[0].model_singular
        });
      },
      ".ui-autocomplete-input autocomplete:select": function (el, ev, data) {
        var index = el.data("index"),
            panel = this.scope.attr("relevant")[index];

        panel.attr("filter", data.item);
        panel.attr("value", true);
      },
      ".remove_filter click": function (el) {
        this.scope.attr("relevant").splice(el.data("index"), 1);
      },
      "{scope.relevant} change": function (list, item, which, type, val, oldVal) {
        this.scope.attr("has_parent", _.findWhere(this.scope.attr("relevant"), {model_name: "__previous__"}));
        if (!/model_name/gi.test(which)) {
          return;
        }
        item.target.attr("filter", new can.Map());
        item.target.attr("value", false);
      }
    }
  });
})(window.can, window.can.$);
