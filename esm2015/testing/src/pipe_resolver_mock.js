/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { PipeResolver } from '@angular/compiler';
export class MockPipeResolver extends PipeResolver {
    constructor(refector) {
        super(refector);
        this._pipes = new Map();
    }
    /**
     * Overrides the {@link Pipe} for a pipe.
     */
    setPipe(type, metadata) { this._pipes.set(type, metadata); }
    /**
     * Returns the {@link Pipe} for a pipe:
     * - Set the {@link Pipe} to the overridden view when it exists or fallback to the
     * default
     * `PipeResolver`, see `setPipe`.
     */
    resolve(type, throwIfNotFound = true) {
        let metadata = this._pipes.get(type);
        if (!metadata) {
            metadata = super.resolve(type, throwIfNotFound);
        }
        return metadata;
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZV9yZXNvbHZlcl9tb2NrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvdGVzdGluZy9zcmMvcGlwZV9yZXNvbHZlcl9tb2NrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBbUIsWUFBWSxFQUFPLE1BQU0sbUJBQW1CLENBQUM7QUFFdkUsTUFBTSx1QkFBd0IsU0FBUSxZQUFZO0lBR2hELFlBQVksUUFBMEI7UUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFGbEQsV0FBTSxHQUFHLElBQUksR0FBRyxFQUF3QixDQUFDO0lBRVUsQ0FBQztJQUU1RDs7T0FFRztJQUNILE9BQU8sQ0FBQyxJQUFlLEVBQUUsUUFBbUIsSUFBVSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXhGOzs7OztPQUtHO0lBQ0gsT0FBTyxDQUFDLElBQWUsRUFBRSxlQUFlLEdBQUcsSUFBSTtRQUM3QyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2IsUUFBUSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBRyxDQUFDO1NBQ25EO1FBQ0QsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBpbGVSZWZsZWN0b3IsIFBpcGVSZXNvbHZlciwgY29yZX0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuXG5leHBvcnQgY2xhc3MgTW9ja1BpcGVSZXNvbHZlciBleHRlbmRzIFBpcGVSZXNvbHZlciB7XG4gIHByaXZhdGUgX3BpcGVzID0gbmV3IE1hcDxjb3JlLlR5cGUsIGNvcmUuUGlwZT4oKTtcblxuICBjb25zdHJ1Y3RvcihyZWZlY3RvcjogQ29tcGlsZVJlZmxlY3RvcikgeyBzdXBlcihyZWZlY3Rvcik7IH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIHRoZSB7QGxpbmsgUGlwZX0gZm9yIGEgcGlwZS5cbiAgICovXG4gIHNldFBpcGUodHlwZTogY29yZS5UeXBlLCBtZXRhZGF0YTogY29yZS5QaXBlKTogdm9pZCB7IHRoaXMuX3BpcGVzLnNldCh0eXBlLCBtZXRhZGF0YSk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUge0BsaW5rIFBpcGV9IGZvciBhIHBpcGU6XG4gICAqIC0gU2V0IHRoZSB7QGxpbmsgUGlwZX0gdG8gdGhlIG92ZXJyaWRkZW4gdmlldyB3aGVuIGl0IGV4aXN0cyBvciBmYWxsYmFjayB0byB0aGVcbiAgICogZGVmYXVsdFxuICAgKiBgUGlwZVJlc29sdmVyYCwgc2VlIGBzZXRQaXBlYC5cbiAgICovXG4gIHJlc29sdmUodHlwZTogY29yZS5UeXBlLCB0aHJvd0lmTm90Rm91bmQgPSB0cnVlKTogY29yZS5QaXBlIHtcbiAgICBsZXQgbWV0YWRhdGEgPSB0aGlzLl9waXBlcy5nZXQodHlwZSk7XG4gICAgaWYgKCFtZXRhZGF0YSkge1xuICAgICAgbWV0YWRhdGEgPSBzdXBlci5yZXNvbHZlKHR5cGUsIHRocm93SWZOb3RGb3VuZCkgITtcbiAgICB9XG4gICAgcmV0dXJuIG1ldGFkYXRhO1xuICB9XG59XG4iXX0=