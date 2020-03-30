export default function IconsUpdater(injector, eventBus) {

  var commandStack = injector.get('commandStack', false);

  if (!commandStack) {
    return;
  }

  function execute(context) {
    const connection = context.connection;

    return [
      connection.source,
      connection.target
    ];
  }

  function UpdateConnectedHandler() {
    this.execute = execute;
    this.revert = execute;
  }

  commandStack.registerHandler('iconsUpdater.updateConnected', UpdateConnectedHandler);

  eventBus.on([
    'commandStack.connection.reconnect.postExecuted',
    'commandStack.connection.create.postExecuted',
    'commandStack.connection.delete.preExecute'
  ], function(event) {

    const context = event.context;

    const connection = context.connection;

    commandStack.execute('iconsUpdater.updateConnected', {
      connection: connection
    });
  });

}

IconsUpdater.$inject = [ 'injector', 'eventBus' ];