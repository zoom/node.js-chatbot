
class ParamError extends Error {
    constructor(message) {
        super(message);
        this.name = 'param';
        this.message = message;
    }
}
class TypeError extends Error {
    constructor(message) {
        super(message);
        this.name = 'type';
        this.message = message;
    }
}

let error = {
  TypeError,
  ParamError,
  token(err) {
    return {
      type: 'token',
      message: err
    };
  },
  clientToken(err) {
    return {
      type: 'clientToken',
      message: err
    };
  },
  code(err) {
    return {
      type: 'code',
      message: err
    };
  },
  action(err) {
    return {
      type: 'action',
      message: err
    };
  }
};


export default error;

