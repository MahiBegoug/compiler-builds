/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Identifiers } from './identifiers';
import * as o from './output/output_ast';
import { R3FactoryDelegateType, compileFactoryFunction } from './render3/r3_factory';
import { mapToMapExpression, typeWithParameters } from './render3/util';
export function compileInjectable(meta) {
    let result = null;
    const factoryMeta = {
        name: meta.name,
        type: meta.type,
        deps: meta.ctorDeps,
        injectFn: Identifiers.inject,
    };
    if (meta.useClass !== undefined) {
        // meta.useClass has two modes of operation. Either deps are specified, in which case `new` is
        // used to instantiate the class with dependencies injected, or deps are not specified and
        // the factory of the class is used to instantiate it.
        //
        // A special case exists for useClass: Type where Type is the injectable type itself, in which
        // case omitting deps just uses the constructor dependencies instead.
        const useClassOnSelf = meta.useClass.isEquivalent(meta.type);
        const deps = meta.userDeps || (useClassOnSelf && meta.ctorDeps) || undefined;
        if (deps !== undefined) {
            // factory: () => new meta.useClass(...deps)
            result = compileFactoryFunction(Object.assign({}, factoryMeta, { delegate: meta.useClass, delegateDeps: deps, delegateType: R3FactoryDelegateType.Class }));
        }
        else {
            result = compileFactoryFunction(Object.assign({}, factoryMeta, { delegate: meta.useClass, delegateType: R3FactoryDelegateType.Factory }));
        }
    }
    else if (meta.useFactory !== undefined) {
        result = compileFactoryFunction(Object.assign({}, factoryMeta, { delegate: meta.useFactory, delegateDeps: meta.userDeps || [], delegateType: R3FactoryDelegateType.Function }));
    }
    else if (meta.useValue !== undefined) {
        // Note: it's safe to use `meta.useValue` instead of the `USE_VALUE in meta` check used for
        // client code because meta.useValue is an Expression which will be defined even if the actual
        // value is undefined.
        result = compileFactoryFunction(Object.assign({}, factoryMeta, { expression: meta.useValue }));
    }
    else if (meta.useExisting !== undefined) {
        // useExisting is an `inject` call on the existing token.
        result = compileFactoryFunction(Object.assign({}, factoryMeta, { expression: o.importExpr(Identifiers.inject).callFn([meta.useExisting]) }));
    }
    else {
        result = compileFactoryFunction(factoryMeta);
    }
    const token = meta.type;
    const providedIn = meta.providedIn;
    const expression = o.importExpr(Identifiers.defineInjectable).callFn([mapToMapExpression({ token, factory: result.factory, providedIn })]);
    const type = new o.ExpressionType(o.importExpr(Identifiers.InjectableDef, [typeWithParameters(meta.type, meta.typeArgumentCount)]));
    return {
        expression,
        type,
        statements: result.statements,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0YWJsZV9jb21waWxlcl8yLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvY29tcGlsZXIvc3JjL2luamVjdGFibGVfY29tcGlsZXJfMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFHSCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzFDLE9BQU8sS0FBSyxDQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDekMsT0FBTyxFQUF1QixxQkFBcUIsRUFBcUIsc0JBQXNCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUM1SCxPQUFPLEVBQUMsa0JBQWtCLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQXFCdEUsTUFBTSxVQUFVLGlCQUFpQixDQUFDLElBQTBCO0lBQzFELElBQUksTUFBTSxHQUE0RCxJQUFJLENBQUM7SUFFM0UsTUFBTSxXQUFXLEdBQUc7UUFDbEIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1FBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1FBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRO1FBQ25CLFFBQVEsRUFBRSxXQUFXLENBQUMsTUFBTTtLQUM3QixDQUFDO0lBRUYsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBRTtRQUMvQiw4RkFBOEY7UUFDOUYsMEZBQTBGO1FBQzFGLHNEQUFzRDtRQUN0RCxFQUFFO1FBQ0YsOEZBQThGO1FBQzlGLHFFQUFxRTtRQUVyRSxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0QsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksU0FBUyxDQUFDO1FBRTdFLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtZQUN0Qiw0Q0FBNEM7WUFDNUMsTUFBTSxHQUFHLHNCQUFzQixtQkFDMUIsV0FBVyxJQUNkLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUN2QixZQUFZLEVBQUUsSUFBSSxFQUNsQixZQUFZLEVBQUUscUJBQXFCLENBQUMsS0FBSyxJQUN6QyxDQUFDO1NBQ0o7YUFBTTtZQUNMLE1BQU0sR0FBRyxzQkFBc0IsbUJBQzFCLFdBQVcsSUFDZCxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFDdkIsWUFBWSxFQUFFLHFCQUFxQixDQUFDLE9BQU8sSUFDM0MsQ0FBQztTQUNKO0tBQ0Y7U0FBTSxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFFO1FBQ3hDLE1BQU0sR0FBRyxzQkFBc0IsbUJBQzFCLFdBQVcsSUFDZCxRQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFDekIsWUFBWSxFQUFFLElBQUksQ0FBQyxRQUFRLElBQUksRUFBRSxFQUNqQyxZQUFZLEVBQUUscUJBQXFCLENBQUMsUUFBUSxJQUM1QyxDQUFDO0tBQ0o7U0FBTSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO1FBQ3RDLDJGQUEyRjtRQUMzRiw4RkFBOEY7UUFDOUYsc0JBQXNCO1FBQ3RCLE1BQU0sR0FBRyxzQkFBc0IsbUJBQzFCLFdBQVcsSUFDZCxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsSUFDekIsQ0FBQztLQUNKO1NBQU0sSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLFNBQVMsRUFBRTtRQUN6Qyx5REFBeUQ7UUFDekQsTUFBTSxHQUFHLHNCQUFzQixtQkFDMUIsV0FBVyxJQUNkLFVBQVUsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsSUFDdkUsQ0FBQztLQUNKO1NBQU07UUFDTCxNQUFNLEdBQUcsc0JBQXNCLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDOUM7SUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ3hCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7SUFFbkMsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxrQkFBa0IsQ0FDcEYsRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQzFDLFdBQVcsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXpGLE9BQU87UUFDTCxVQUFVO1FBQ1YsSUFBSTtRQUNKLFVBQVUsRUFBRSxNQUFNLENBQUMsVUFBVTtLQUM5QixDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RGbGFnc30gZnJvbSAnLi9jb3JlJztcbmltcG9ydCB7SWRlbnRpZmllcnN9IGZyb20gJy4vaWRlbnRpZmllcnMnO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7UjNEZXBlbmRlbmN5TWV0YWRhdGEsIFIzRmFjdG9yeURlbGVnYXRlVHlwZSwgUjNGYWN0b3J5TWV0YWRhdGEsIGNvbXBpbGVGYWN0b3J5RnVuY3Rpb259IGZyb20gJy4vcmVuZGVyMy9yM19mYWN0b3J5JztcbmltcG9ydCB7bWFwVG9NYXBFeHByZXNzaW9uLCB0eXBlV2l0aFBhcmFtZXRlcnN9IGZyb20gJy4vcmVuZGVyMy91dGlsJztcblxuZXhwb3J0IGludGVyZmFjZSBJbmplY3RhYmxlRGVmIHtcbiAgZXhwcmVzc2lvbjogby5FeHByZXNzaW9uO1xuICB0eXBlOiBvLlR5cGU7XG4gIHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUjNJbmplY3RhYmxlTWV0YWRhdGEge1xuICBuYW1lOiBzdHJpbmc7XG4gIHR5cGU6IG8uRXhwcmVzc2lvbjtcbiAgdHlwZUFyZ3VtZW50Q291bnQ6IG51bWJlcjtcbiAgY3RvckRlcHM6IFIzRGVwZW5kZW5jeU1ldGFkYXRhW118bnVsbDtcbiAgcHJvdmlkZWRJbjogby5FeHByZXNzaW9uO1xuICB1c2VDbGFzcz86IG8uRXhwcmVzc2lvbjtcbiAgdXNlRmFjdG9yeT86IG8uRXhwcmVzc2lvbjtcbiAgdXNlRXhpc3Rpbmc/OiBvLkV4cHJlc3Npb247XG4gIHVzZVZhbHVlPzogby5FeHByZXNzaW9uO1xuICB1c2VyRGVwcz86IFIzRGVwZW5kZW5jeU1ldGFkYXRhW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlSW5qZWN0YWJsZShtZXRhOiBSM0luamVjdGFibGVNZXRhZGF0YSk6IEluamVjdGFibGVEZWYge1xuICBsZXQgcmVzdWx0OiB7ZmFjdG9yeTogby5FeHByZXNzaW9uLCBzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdfXxudWxsID0gbnVsbDtcblxuICBjb25zdCBmYWN0b3J5TWV0YSA9IHtcbiAgICBuYW1lOiBtZXRhLm5hbWUsXG4gICAgdHlwZTogbWV0YS50eXBlLFxuICAgIGRlcHM6IG1ldGEuY3RvckRlcHMsXG4gICAgaW5qZWN0Rm46IElkZW50aWZpZXJzLmluamVjdCxcbiAgfTtcblxuICBpZiAobWV0YS51c2VDbGFzcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gbWV0YS51c2VDbGFzcyBoYXMgdHdvIG1vZGVzIG9mIG9wZXJhdGlvbi4gRWl0aGVyIGRlcHMgYXJlIHNwZWNpZmllZCwgaW4gd2hpY2ggY2FzZSBgbmV3YCBpc1xuICAgIC8vIHVzZWQgdG8gaW5zdGFudGlhdGUgdGhlIGNsYXNzIHdpdGggZGVwZW5kZW5jaWVzIGluamVjdGVkLCBvciBkZXBzIGFyZSBub3Qgc3BlY2lmaWVkIGFuZFxuICAgIC8vIHRoZSBmYWN0b3J5IG9mIHRoZSBjbGFzcyBpcyB1c2VkIHRvIGluc3RhbnRpYXRlIGl0LlxuICAgIC8vXG4gICAgLy8gQSBzcGVjaWFsIGNhc2UgZXhpc3RzIGZvciB1c2VDbGFzczogVHlwZSB3aGVyZSBUeXBlIGlzIHRoZSBpbmplY3RhYmxlIHR5cGUgaXRzZWxmLCBpbiB3aGljaFxuICAgIC8vIGNhc2Ugb21pdHRpbmcgZGVwcyBqdXN0IHVzZXMgdGhlIGNvbnN0cnVjdG9yIGRlcGVuZGVuY2llcyBpbnN0ZWFkLlxuXG4gICAgY29uc3QgdXNlQ2xhc3NPblNlbGYgPSBtZXRhLnVzZUNsYXNzLmlzRXF1aXZhbGVudChtZXRhLnR5cGUpO1xuICAgIGNvbnN0IGRlcHMgPSBtZXRhLnVzZXJEZXBzIHx8ICh1c2VDbGFzc09uU2VsZiAmJiBtZXRhLmN0b3JEZXBzKSB8fCB1bmRlZmluZWQ7XG5cbiAgICBpZiAoZGVwcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBmYWN0b3J5OiAoKSA9PiBuZXcgbWV0YS51c2VDbGFzcyguLi5kZXBzKVxuICAgICAgcmVzdWx0ID0gY29tcGlsZUZhY3RvcnlGdW5jdGlvbih7XG4gICAgICAgIC4uLmZhY3RvcnlNZXRhLFxuICAgICAgICBkZWxlZ2F0ZTogbWV0YS51c2VDbGFzcyxcbiAgICAgICAgZGVsZWdhdGVEZXBzOiBkZXBzLFxuICAgICAgICBkZWxlZ2F0ZVR5cGU6IFIzRmFjdG9yeURlbGVnYXRlVHlwZS5DbGFzcyxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgPSBjb21waWxlRmFjdG9yeUZ1bmN0aW9uKHtcbiAgICAgICAgLi4uZmFjdG9yeU1ldGEsXG4gICAgICAgIGRlbGVnYXRlOiBtZXRhLnVzZUNsYXNzLFxuICAgICAgICBkZWxlZ2F0ZVR5cGU6IFIzRmFjdG9yeURlbGVnYXRlVHlwZS5GYWN0b3J5LFxuICAgICAgfSk7XG4gICAgfVxuICB9IGVsc2UgaWYgKG1ldGEudXNlRmFjdG9yeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmVzdWx0ID0gY29tcGlsZUZhY3RvcnlGdW5jdGlvbih7XG4gICAgICAuLi5mYWN0b3J5TWV0YSxcbiAgICAgIGRlbGVnYXRlOiBtZXRhLnVzZUZhY3RvcnksXG4gICAgICBkZWxlZ2F0ZURlcHM6IG1ldGEudXNlckRlcHMgfHwgW10sXG4gICAgICBkZWxlZ2F0ZVR5cGU6IFIzRmFjdG9yeURlbGVnYXRlVHlwZS5GdW5jdGlvbixcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChtZXRhLnVzZVZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAvLyBOb3RlOiBpdCdzIHNhZmUgdG8gdXNlIGBtZXRhLnVzZVZhbHVlYCBpbnN0ZWFkIG9mIHRoZSBgVVNFX1ZBTFVFIGluIG1ldGFgIGNoZWNrIHVzZWQgZm9yXG4gICAgLy8gY2xpZW50IGNvZGUgYmVjYXVzZSBtZXRhLnVzZVZhbHVlIGlzIGFuIEV4cHJlc3Npb24gd2hpY2ggd2lsbCBiZSBkZWZpbmVkIGV2ZW4gaWYgdGhlIGFjdHVhbFxuICAgIC8vIHZhbHVlIGlzIHVuZGVmaW5lZC5cbiAgICByZXN1bHQgPSBjb21waWxlRmFjdG9yeUZ1bmN0aW9uKHtcbiAgICAgIC4uLmZhY3RvcnlNZXRhLFxuICAgICAgZXhwcmVzc2lvbjogbWV0YS51c2VWYWx1ZSxcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChtZXRhLnVzZUV4aXN0aW5nICE9PSB1bmRlZmluZWQpIHtcbiAgICAvLyB1c2VFeGlzdGluZyBpcyBhbiBgaW5qZWN0YCBjYWxsIG9uIHRoZSBleGlzdGluZyB0b2tlbi5cbiAgICByZXN1bHQgPSBjb21waWxlRmFjdG9yeUZ1bmN0aW9uKHtcbiAgICAgIC4uLmZhY3RvcnlNZXRhLFxuICAgICAgZXhwcmVzc2lvbjogby5pbXBvcnRFeHByKElkZW50aWZpZXJzLmluamVjdCkuY2FsbEZuKFttZXRhLnVzZUV4aXN0aW5nXSksXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gY29tcGlsZUZhY3RvcnlGdW5jdGlvbihmYWN0b3J5TWV0YSk7XG4gIH1cblxuICBjb25zdCB0b2tlbiA9IG1ldGEudHlwZTtcbiAgY29uc3QgcHJvdmlkZWRJbiA9IG1ldGEucHJvdmlkZWRJbjtcblxuICBjb25zdCBleHByZXNzaW9uID0gby5pbXBvcnRFeHByKElkZW50aWZpZXJzLmRlZmluZUluamVjdGFibGUpLmNhbGxGbihbbWFwVG9NYXBFeHByZXNzaW9uKFxuICAgICAge3Rva2VuLCBmYWN0b3J5OiByZXN1bHQuZmFjdG9yeSwgcHJvdmlkZWRJbn0pXSk7XG4gIGNvbnN0IHR5cGUgPSBuZXcgby5FeHByZXNzaW9uVHlwZShvLmltcG9ydEV4cHIoXG4gICAgICBJZGVudGlmaWVycy5JbmplY3RhYmxlRGVmLCBbdHlwZVdpdGhQYXJhbWV0ZXJzKG1ldGEudHlwZSwgbWV0YS50eXBlQXJndW1lbnRDb3VudCldKSk7XG5cbiAgcmV0dXJuIHtcbiAgICBleHByZXNzaW9uLFxuICAgIHR5cGUsXG4gICAgc3RhdGVtZW50czogcmVzdWx0LnN0YXRlbWVudHMsXG4gIH07XG59XG4iXX0=