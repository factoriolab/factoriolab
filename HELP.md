# Factorio Lab Docs

Welcome to Factorio Lab! This is a tool that can be used to calculate resource and factory requirements for the game [Factorio](https://factorio.com). Specify what products you want your factory to produce, and the calculator will tell you which factories and resources you need to produce those outputs.

In general, the user interface for this tool is heavily influenced by the design of the Kirk McDonald calculator, so users of that tool should feel at home in this tool.

## Products

### Change a Product

Factorio Lab will start with a default product for your factory, usually 1 wooden chest per minute. There are a few ways you can customize this for a single product.

1. To change which product you want to produce, click on the product icon, which should be next to the +/- buttons. This should open a menu similar to the in-game menu that can be used to select which item you want to produce. Note that some items do not have a direct recipe, and those may be listed under a "?" category that is not found in game.
1. To change how much of the product you want to produce, enter a new number in the field next to the product icon. For example, in order to specify 60 items per minute, simply enter 60 in this field.
1. Optionally, use the select dropdown next to this list to specify a different kind of rate. By default this will be Items, but you can also specify to produce a certain number of belts or cargo wagons of an item, or even to produce as much as possible from a specific number of factories.

### Add and Remove Products

In order to add extra products, simply use the + icon next to the products list. This will directly open the items menu, and you can select which item you want to add to the list. Duplicates are allowed. By default this will add "1 Items" of the chosen item, you can change the rate and rate type after selecting the item.

To remove a product, simply select the - icon next to the product in the products list.

## Steps

### Change Steps

Once the products list is set, the list of steps to produce these products will be listed below the products list, in table format. The columns included are # of Items, Belts, and Factories, then Modules and Beacons on those factories.

Each step of the process is fully customizable.

- In order to ignore a specific item's inputs, simply select the item icon, and it will be greyed out to indicate that inputs to that item are being ignored. To include it, simply click it again.
- To change what belt to use to transport an item, select the belt icon, and choose a different belt. Note that this is not available for all items, such as fluids.
- To change what factory to use, select the factory icon, and choose a different factory. Note that this is not available for all items, such as items that can only be produced by one factory.
- To change what modules are used by the factories, either select the first module and your choice will be applied to all module slots, or choose other specific modules to swap out and use separate modules for each slot.
- To change what beacons are used by the factories, select the module in the beacon column to choose a different beacon module, and increment the number field to change the number of modules in beacons. Note: This _does_ mean number modules in beacons, not number of beacons themselves.

If specific steps are modified, an "undo" icon will be available for each modified row and column, that can be used to reset an entire row or column back to the defaults.

### Other Step Features

At the far right of each row is an arrow/link icon. This "drill-down" link can be used to open a new tab of Factorio Lab with only that row's items as products.

To the left of most intermediate steps, there should be an down-arrow. Clicking on that arrow will expand additional information about that specific step.

- The first group of information shows what inputs go into this step, and what percentage of those items go into this step. For example, for an electronic circuit step, perhaps this would show that 50% of your iron plates are going into electronic circuits.
- The second group of information shows where the items in this step are going, and what percentage are going into each other step. For example, for the same electronic circuit step, this might show that 25% of your electronic circuits are going into advanced circuits.

Steps are ordered by "depth," which is determined by how many levels that step is from the final products. For example in a steel production factory, steel would be depth "0", iron plates would be depth "1", and iron ore would be depth "3".

For items that do not have a simple recipe, or items that have multiple possible recipes, note that the recipe/factory that appears in a step may not appear to match up with the item in that step. Once the tool reaches a point that it needs to calculate these steps, it does so in bulk, and the recipes and items may not match up in the results. If this case occurs, setting the factory, modules, and beacons options on that step will actually apply those settings to the recipe shown in that row, not the item shown in that row.

## Settings

Settings can be used to configure the version and mods of the game, as well as defaults and bonuses used by the calculator. The settings menu can be opened by either the iron gear wheel in the upper left corner, or the "Settings" menu item in the navigation bar.

### Recipes

#### Base Recipe

By default, Factorio Lab uses the latest vanilla recipe set in Factorio. However, you can still use the last stable version of 0.16 or 0.17. In addition, Factorio Lab is intended to be expanded to support multiple "overhaul" mods as a base recipe set, such as Krastorio 2.

#### Mod Recipe Sets

Smaller mods can be added via as well, via checked list. While not technically a mod, the original built in "mod" to Factorio Lab adds direct support to add infinite research technologies as a product, which allows you to see the number of labs you need to consume that science in addition to the requirements of the rest of the factory.

#### Disable Recipes

Complex recipes can be enabled or disabled in this section. The most common use case for this is to select a specific oil recipe to use; basic, advanced, or coal liquefaction. However, especially with mods, it is important to manage which recipes are in use in your factory.

#### Expensive

Expensive mode, or expensive recipes, can be enabled or disabled via this checkbox.

### Display Rate

This setting affects all "Items" and "Cargo Wagons" numbers in the tool. By default, rates are displayed as # per minute, but this can be changed to # per second or # per hour.

### Precision

This setting controls the number of significant digits displayed in the tool. This can be configured separately for the Items, Belts, and Factories columns. Calculations internally use BigInt rationals, so it is also possible to display the values using fractions by selecting the "1/3" radio button on the right.

### Factory

#### Factory Rank

This button allows specifying which factories are preferred. For example, you can specify to prefer Assembling machine 1 over Assembling machine 3, and the tool will use Assembling machine 1 wherever possible.

Clicking a factory in the "Preferred" list will remove it from the "Preferred" list, and clicking a factory in the "Not Preferred" list will add it to the end of the "Preferred" list. To completely reset this option, it may be simplest to move all factories into the "Not Preferred" list and then select factories in the order you prefer.

All factories that are listed "Not Preferred" are treated with the same rank, so if the preferred list is empty, the tool will simply pick the first allowed factory for each step.

#### Belt

This button allows specifying the default preferred belt in the factory.

#### Fuel

This button allows specifying the preferred fuel in the factory, for use with burner factories like stone furnaces.

#### Pipe Flow Rate

This establishes the expected flow rate in pipes, which is determined by the length of pipe between undergrounds. The [Factorio Wiki](https://wiki.factorio.com/Fluid_system#Pipelines) contains a table with values that can be entered here. This affects the number of pipes the tool will determine that you need of a particular fluid, which is shown in the Belt column of the steps.

### Modules

#### Module Rank

This button allows specifying which modules are preferred. For example, you can specify to prefer Productivity module 3 over Speed module 3, and the tool will use Productivity module 3 wherever possible. Note that in vanilla Factorio, this rank is generally only used to distinguish between productivity and speed/efficiency modules, since productivity modules are not allowed on all recipes.

Generally, this interface is similar to the [Factory Rank](#Factory-Rank) selection.

#### Beacon Module

This button allows specifying the default preferred module to use in beacons in the factory.

#### Beacon Count

This input field allows specifying the default number of modules in beacons that apply to factories.

#### Toggle Drill Modules

This toggle field allows specifying whether to use modules and beacons with mining drills. In general, mining fields do not use the same, if any, modules or beacons as the rest of the factory. By leaving this unchecked, modules and beacons will not be added to raw mining factories. To treat mining factories the same as all other factories, simply toggle this field by clicking it.

### Bonuses

#### Mining Productivity Bonus

This input field allows specifying the current mining productivity bonus, which affects the number of mining factories that are required for a factory. Generally this is incremented by the mining productivity infinite research, and the current value can be checked in game.

#### Research Speed Bonus

This selection field allows specifying the current research speed bonus, which is incremented by the research speed technologies in game. In vanilla Factorio, the highest level available is Research Speed 6.

### Theme

Use this selection to change from Dark Mode to Light Mode. Note that this setting is persisted to Local Storage, and will be used the next time you visit Factorio Lab. This setting is not included in the URL, so if you share a link to Factorio Lab, it will not affect the theme for anyone who uses that link.

## Hierarchy

The hierarchy is a unique view into your factory. At the center of the sunburst diagram are all the end products of your factory shown as arcs in a circle. One step out from each of these arcs are the inputs to that product, and so on for each arc until the raw materials are reached.

Note that in factories that use complex recipes such as oil calculations, the hierarchy will not be available for those oil recipes.

Below the sunburst there is a list of steps for the currently selected node, which is the root by default. Only the steps one level below the current node are shown, so the steps specifically for the products of your factory would be shown.

To drill down, select a different arc. The list of steps will be updated to show what is required for that specific node. It is possible to drill down multiple levels at once.

To drill back up one level, click the circle in the very center of the diagram. To drill back up directly to the root, simply click on the currently selected node a second time.

Above the sunburst diagram, there is also a list of breadcrumbs that can be used to navigate to specific nodes in the hierarchy.

## Other Features

### Tooltips

Tooltips are available on most icons, and will show different information depending on context.

- Item - Name
- Belt - Speed
- Factory - Speed and # of Modules supported
- Module - Effects of the module
- Recipe - Time, inputs, and outputs of the recipe

### Link Sharing

The settings and products of Factorio Lab are persisted using a hash in the URL. For simple factories this may be shown in plain text, but for complex settings this is zipped/encoded to reduce the size of the string. Note that the encoded url can be converted back to plain text by use of atob and inflate.

The link will include the list of products, any modifications to specific items and recipes in the steps list, and the settings (excluding only the Theme).
