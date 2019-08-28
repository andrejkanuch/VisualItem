module Resco {
    export class Exception {
        constructor(msg?: string, ex?: Exception) {
			this.message = msg;
			this.innerException = ex;
        }

		public message: string;
		public innerException: Exception;

        static as(obj: any): Exception {
            if (obj instanceof Exception) {
                return <Exception>obj;
            }
            return null;
        }

        get name(): string {
            return this._getName();
        }

        public _getName(): string {
            return "Exception";
        }
    }

    export class ArgumentOutOfRangeException extends Exception {
        public _getName(): string {
            return "ArgumentOutOfRangeException";
        }
    }

    export class ArgumentNullException extends Exception {
        public _getName(): string {
            return "ArgumentNullException";
        }
    }

    export class ArgumentException extends Exception {
        public _getName(): string {
            return "ArgumentException";
        }
    }

    export class FormatException extends Exception {
        public _getName(): string {
            return "FormatException";
        }
    }

    export class NotImplementedException extends Exception {
        public _getName(): string {
            return "NotImplementedException";
        }
    }

    export class InvalidOperationException extends Exception {
        public _getName(): string {
            return "InvalidOperationException";
        }
    }
   
    export class IndexOutOfRangeException extends Exception {
    }
}
